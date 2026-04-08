const db = require("./config/db");

const seedDatabase = async () => {
  try {
    console.log("🚀 Initializing Database Schema & Seed...");

    await db.query(`
      DROP TABLE IF EXISTS unit_scans CASCADE;
      DROP TABLE IF EXISTS waybill_logs CASCADE;
      DROP TABLE IF EXISTS wb_advice CASCADE;
      DROP TABLE IF EXISTS waybills CASCADE;
      DROP TABLE IF EXISTS units CASCADE;
      DROP TABLE IF EXISTS unit_logs CASCADE;
      DROP TABLE IF EXISTS warehouses CASCADE;
      DROP TABLE IF EXISTS clients CASCADE;
      DROP TABLE IF EXISTS waybill_scans CASCADE;
      DROP TABLE IF EXISTS unit_advice CASCADE;
      DROP TABLE IF EXISTS unit_history CASCADE;
      DROP TABLE IF EXISTS unit_advice CASCADE;
      DROP TABLE IF EXISTS waybill_history CASCADE;
      DROP TABLE IF EXISTS waybill_advice CASCADE;
      DROP TABLE IF EXISTS waybill_manifest CASCADE;
      DROP TABLE IF EXISTS activity_logs CASCADE;
      DROP TABLE IF EXISTS trucks CASCADE;
      DROP TABLE IF EXISTS locations CASCADE;
      DROP TABLE IF EXISTS drivers CASCADE;
    `);
    console.log("🗑️  Old tables dropped.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS trucks (
        id SERIAL PRIMARY KEY,
        plate_number VARCHAR(20) UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS drivers (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS units (
        id SERIAL PRIMARY KEY,
        engine VARCHAR(50) UNIQUE,
        frame VARCHAR(50) UNIQUE,
        model VARCHAR(50),
        color VARCHAR(50),
        status VARCHAR(50) DEFAULT 'IN_STORAGE' NOT NULL,
        da VARCHAR(50),  
        last_location_id INT REFERENCES locations(id), 
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS waybill_advice (
        id VARCHAR(100) PRIMARY KEY, -- Smart ID: adv-ORIG-DEST-YYYYMMDD
        origin_id INT REFERENCES locations(id),
        destination_id INT REFERENCES locations(id),
        client VARCHAR(100),
        truck_id INT REFERENCES trucks(id),
        driver_id INT REFERENCES drivers(id),
        expected_quantity INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS waybills (
        id VARCHAR(100) PRIMARY KEY, -- Smart ID: ORIG-DEST-YYYYMMDD
        advice_id VARCHAR(100), -- Smart ID: adv-ORIG-DEST-YYYYMMDD
        status VARCHAR(50),
        origin_id INT REFERENCES locations(id),
        destination_id INT REFERENCES locations(id),
        client VARCHAR(100),
        truck_id INT REFERENCES trucks(id),
        driver_id INT REFERENCES drivers(id),
        departure_photo_url TEXT,
        arrival_photo_url TEXT
      );

      -- Selective SCD2 Implementation
      CREATE TABLE IF NOT EXISTS unit_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        unit_id INT REFERENCES units(id) ON DELETE CASCADE,
        engine VARCHAR(50),
        frame VARCHAR(50),
        model VARCHAR(50),
        color VARCHAR(50),
        status VARCHAR(50),
        da VARCHAR(50),
        last_location_id INT REFERENCES locations(id), 
        eff_start TIMESTAMP WITH TIME ZONE NOT NULL,
        eff_end TIMESTAMP WITH TIME ZONE,
        is_current BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS waybill_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        waybill_id VARCHAR(100) REFERENCES waybills(id) ON DELETE CASCADE,
        status VARCHAR(50),
        origin_id INT REFERENCES locations(id),
        destination_id INT REFERENCES locations(id),
        truck_id INT REFERENCES trucks(id),
        driver_id INT REFERENCES drivers(id),
        departure_photo_url TEXT,
        arrival_photo_url TEXT,
        eff_start TIMESTAMP WITH TIME ZONE NOT NULL,
        eff_end TIMESTAMP WITH TIME ZONE,
        is_current BOOLEAN DEFAULT FALSE
      );  

      -- Forensics Table
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        user_id VARCHAR(100), -- subject to change
        entity_type VARCHAR(100) NOT NULL,
        entity_id UUID NOT NULL,
        event_type TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb
      );

      -- Join Tables
      CREATE TABLE IF NOT EXISTS waybill_manifest (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        waybill_id VARCHAR(100) REFERENCES waybills(id)  ON DELETE CASCADE,
        unit_id INT REFERENCES units(id),
        manifest_type TEXT NOT NULL, 
        user_id VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS unit_advice (
        id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid(),
        advice_id VARCHAR(100) REFERENCES waybill_advice(id) ON DELETE CASCADE,
        unit_id INT REFERENCES units(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    await db.query(
      `
      -- 1. Create the Function
      CREATE OR REPLACE FUNCTION handle_unit_scd2()
      RETURNS TRIGGER AS $$
      BEGIN
        -- 1. 'Expire' the old version
        UPDATE unit_history
        SET eff_end = now(),
            is_current = FALSE
        WHERE unit_id = NEW.id AND is_current = TRUE;

        -- 2. Insert the new version
        INSERT INTO unit_history (
          unit_id, engine, frame, model, color, status, last_location_id, eff_start, is_current
        )
        VALUES (
          NEW.id, NEW.engine, NEW.frame, NEW.model, NEW.color, NEW.status, NEW.last_location_id, now(), TRUE
        );

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- 2. Create the Trigger
      CREATE TRIGGER on_unit_update
      AFTER INSERT OR UPDATE ON units
      FOR EACH ROW EXECUTE FUNCTION handle_unit_scd2();
      `,
    );

    await db.query(`
      INSERT INTO locations (id, name, type) 
      VALUES
        (1, 'Central Hub - Makati', 'WAREHOUSE'),
        (2, 'North Luzon Depot', 'WAREHOUSE'),
        (3, 'Cebu Distribution Center', 'WAREHOUSE'),
        (4, 'Sta. Rosa Main Plant', 'PLANT'),
        (5, 'End Consumer / Dealer', 'CONSUMER')
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        type = EXCLUDED.type;

      INSERT INTO trucks (id, plate_number) 
      VALUES
        (1, 'NBD-1234'),
        (2, 'RVM-5678'),
        (3, 'WMS-9012'),
        (4, 'TBA-0000')
      ON CONFLICT (id) DO UPDATE SET 
        plate_number = EXCLUDED.plate_number;

      INSERT INTO drivers (id, full_name) 
      VALUES
        (1, 'Ricardo Dalisay'),
        (2, 'Juan Dela Cruz'),
        (3, 'Maria Clara')
      ON CONFLICT (id) DO UPDATE SET 
        full_name = EXCLUDED.full_name;
      `);

    await db.query(`
      -- 1. Create the Function for Waybills
      CREATE OR REPLACE FUNCTION handle_waybill_scd2()
      RETURNS TRIGGER AS $$
      BEGIN
        -- 1. 'Expire' the previous current version
        UPDATE waybill_history
        SET eff_end = now(),
            is_current = FALSE
        WHERE waybill_id = NEW.id AND is_current = TRUE;

        -- 2. Insert the new version with updated details
        INSERT INTO waybill_history (
          waybill_id, 
          status, 
          origin_id, 
          destination_id, 
          truck_id, 
          driver_id, 
          departure_photo_url,
          arrival_photo_url,
          eff_start, 
          is_current
        )
        VALUES (
          NEW.id, 
          NEW.status, 
          NEW.origin_id, 
          NEW.destination_id, 
          NEW.truck_id, 
          NEW.driver_id, 
          NEW.departure_photo_url, 
          NEW.arrival_photo_url,
          now(), 
          TRUE
        );

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- 2. Create the Trigger on the Waybills table
      CREATE TRIGGER on_waybill_update
      AFTER INSERT OR UPDATE ON waybills
      FOR EACH ROW EXECUTE FUNCTION handle_waybill_scd2();
    `);

    await db.query(`
      -- 1. Create 2 Units (Started as IN_STORAGE)
      INSERT INTO units (id, engine, frame, model, color, status, last_location_id)
      VALUES 
        ('1', 'ENG-P1-001', 'FRM-P1-001', 'Model1', 'RD', 'IN_STORAGE', 1),
        ('2', 'ENG-P1-002', 'FRM-P1-002', 'Model1', 'RD', 'IN_STORAGE', 1);

      -- 1.5. Create the Advice (The Plan)
      INSERT INTO waybill_advice (id, origin_id, destination_id, client, expected_quantity)
      VALUES ('adv1', 1, 2, 'Client Beta', 2);

      -- 2. Create the Waybill (Started as LOADING)
      INSERT INTO waybills (id, advice_id, status, origin_id, destination_id, client, truck_id, driver_id)
      VALUES ('wb1', 'adv1', 'ADVICE', 1, 2, 'Client Alpha', 1, 1);

      -- 1. Create the Advice (The Plan)
      INSERT INTO waybill_advice (id, origin_id, destination_id, client, expected_quantity)
      VALUES ('adv2', 2, 3, 'Client Beta', 3);

      -- 2. Create 3 Units
      INSERT INTO units (id, engine, frame, model, color, status, last_location_id)
      VALUES 
        ('3', 'ENG-P2-003', 'FRM-P2-003', 'Model2', 'BL', 'IN_STORAGE', 2),
        ('4', 'ENG-P2-004', 'FRM-P2-004', 'Model2', 'BL', 'IN_STORAGE', 2),
        ('5', 'ENG-P2-005', 'FRM-P2-005', 'Model2', 'BL', 'IN_STORAGE', 2);

      -- 3. Create Unit Advice (The Expected List)
      INSERT INTO unit_advice (advice_id, unit_id)
      VALUES 
        ('adv2', 3),
        ('adv2', 4),
        ('adv2', 5);

      -- 4. Create Waybill and Cycle through Statuses to populate SCD2 History
      INSERT INTO waybills (id, advice_id, status, origin_id, destination_id, client, truck_id, driver_id)
      VALUES ('wb2', 'adv2', 'LOADING', 2, 3, 'Client Beta', 2, 2);

      -- Simulating the Physical Movement
      -- Departure Scan
      INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type) 
      VALUES ('wb2', 3, 'DEPARTURE'), ('wb2', 4, 'DEPARTURE'), ('wb2', 5, 'DEPARTURE');

      UPDATE waybills SET status = 'IN_TRANSIT' WHERE id = 'wb2';
      UPDATE units SET status = 'IN_TRANSIT', last_location_id = 2 WHERE id IN ('3', '4', '5');

      -- Arrival Scan
      INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type) 
      VALUES ('wb2', 3, 'ARRIVAL'), ('wb2', 4, 'ARRIVAL'), ('wb2', 5, 'ARRIVAL');

      UPDATE waybills SET status = 'ARRIVED' WHERE id = 'wb2';
      UPDATE units SET status = 'IN_STORAGE', last_location_id = 2 WHERE id IN ('3', '4', '5');

      -- Final Closure
      UPDATE waybills SET status = 'CLOSED' WHERE id = 'wb2';
      
    `);

    await db.query(
      `SELECT setval(pg_get_serial_sequence('units', 'id'), (SELECT MAX(id) FROM units));`,
    );

    console.log("✨ Smart Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err.stack);
    process.exit(1);
  }
};

seedDatabase();
