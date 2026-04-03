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
    `);
    console.log("🗑️  Old tables dropped.");
    
    await db.query(`
      CREATE TABLE units (
        id VARCHAR(50) PRIMARY KEY,
        engine VARCHAR(50) UNIQUE,
        frame VARCHAR(50) UNIQUE,
        model VARCHAR(50),
        color VARCHAR(50),
        status VARCHAR(50) DEFAULT 'IN_STORAGE' NOT NULL,
        da VARCHAR(50),  
        current_location VARCHAR(50) NOT NULL, 
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE TABLE waybill_advice (
        id VARCHAR(100) PRIMARY KEY, -- Smart ID: adv-ORIG-DEST-YYYYMMDD
        origin VARCHAR(50),
        destination VARCHAR(50),
        client VARCHAR(100),
        truck VARCHAR(50),
        driver VARCHAR(50),
        expected_quantity INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE TABLE waybills (
        id VARCHAR(100) PRIMARY KEY, -- Smart ID: ORIG-DEST-YYYYMMDD
        advice_id VARCHAR(100), -- Smart ID: adv-ORIG-DEST-YYYYMMDD
        status VARCHAR(50),
        origin VARCHAR(50),
        destination VARCHAR(50),
        client VARCHAR(100),
        truck VARCHAR(50),
        driver VARCHAR(50),
        departure_photo_url TEXT,
        arrival_photo_url TEXT
      );

      -- Selective SCD2 Implementation
      CREATE TABLE unit_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        unit_id VARCHAR(50) REFERENCES units(id) ON DELETE CASCADE,
        engine VARCHAR(50),
        frame VARCHAR(50),
        model VARCHAR(50),
        color VARCHAR(50),
        status VARCHAR(50),
        da VARCHAR(50),
        current_location VARCHAR(50),
        eff_start TIMESTAMP WITH TIME ZONE NOT NULL,
        eff_end TIMESTAMP WITH TIME ZONE,
        is_current BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE waybill_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        waybill_id VARCHAR(100) REFERENCES waybills(id) ON DELETE CASCADE,
        status VARCHAR(50),
        origin VARCHAR(50),
        destination VARCHAR(50),
        truck VARCHAR(50),
        driver VARCHAR(50),
        departure_photo_url TEXT,
        arrival_photo_url TEXT,
        eff_start TIMESTAMP WITH TIME ZONE NOT NULL,
        eff_end TIMESTAMP WITH TIME ZONE,
        is_current BOOLEAN DEFAULT FALSE
      );  

      -- Forensics Table
      CREATE TABLE activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        user_id VARCHAR(100), -- subject to change
        entity_type VARCHAR(100) NOT NULL,
        entity_id UUID NOT NULL,
        event_type TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb
      );

      -- Join Tables
      CREATE TABLE waybill_manifest (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        waybill_id VARCHAR(100) REFERENCES waybills(id)  ON DELETE CASCADE,
        unit_id VARCHAR(50) REFERENCES units(id),
        manifest_type TEXT NOT NULL, 
        user_id VARCHAR(100), -- subject to change
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE TABLE unit_advice (
        id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid(),
        advice_id VARCHAR(100) REFERENCES waybill_advice(id) ON DELETE CASCADE,
        unit_id VARCHAR(50) REFERENCES units(id),
        
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
          unit_id, engine, frame, model, color, status, current_location, eff_start, is_current
        )
        VALUES (
          NEW.id, NEW.engine, NEW.frame, NEW.model, NEW.color, NEW.status, NEW.current_location, now(), TRUE
        );

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- 2. Create the Trigger
      CREATE TRIGGER on_unit_update
      AFTER INSERT OR UPDATE ON units
      FOR EACH ROW EXECUTE FUNCTION handle_unit_scd2();
      `
    );

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
          origin, 
          destination, 
          truck, 
          driver, 
          departure_photo_url,
          arrival_photo_url,
          eff_start, 
          is_current
        )
        VALUES (
          NEW.id, 
          NEW.status, 
          NEW.origin, 
          NEW.destination, 
          NEW.truck, 
          NEW.driver, 
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
    `)

    await db.query(`
      -- 1. Create 2 Units (Started as IN_STORAGE)
      INSERT INTO units (id, engine, frame, model, color, status, current_location)
      VALUES 
        ('1', 'ENG-P1-001', 'FRM-P1-001', 'Model1', 'RD', 'IN_STORAGE', 'Makati Warehouse'),
        ('2', 'ENG-P1-002', 'FRM-P1-002', 'Model1', 'RD', 'IN_STORAGE', 'Makati Warehouse');

      -- 2. Create the Waybill (Started as LOADING)
      INSERT INTO waybills (id, status, origin, destination, client, truck, driver)
      VALUES ('wb1', 'LOADING', 'Makati Warehouse', 'Cebu Hub', 'Client Alpha', 'ABC-1234', 'Juan Dela Cruz');

      -- 3. Link them in the Manifest (The "Scan")
      INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type)
      VALUES 
        ('wb1', '1', 'DEPARTURE'),
        ('wb1', '2', 'DEPARTURE');

      -- 4. TRIGGER ACTION: Move to IN_TRANSIT
      -- This will automatically expire the 'IN_STORAGE' history and create 'IN_TRANSIT' history
      UPDATE units SET status = 'IN_TRANSIT', current_location = 'ABC-1234' WHERE id IN ('1', '2');
      UPDATE waybills SET status = 'IN_TRANSIT' WHERE id = 'wb1';

      -- 1. Create the Advice (The Plan)
      INSERT INTO waybill_advice (id, origin, destination, client, expected_quantity)
      VALUES ('adv2', 'Batangas Port', 'Davao Depot', 'Client Beta', 3);

      -- 2. Create 3 Units
      INSERT INTO units (id, engine, frame, model, color, status, current_location)
      VALUES 
        ('3', 'ENG-P2-003', 'FRM-P2-003', 'Model2', 'BL', 'IN_STORAGE', 'Batangas Port'),
        ('4', 'ENG-P2-004', 'FRM-P2-004', 'Model2', 'BL', 'IN_STORAGE', 'Batangas Port'),
        ('5', 'ENG-P2-005', 'FRM-P2-005', 'Model2', 'BL', 'IN_STORAGE', 'Batangas Port');

      -- 3. Create Unit Advice (The Expected List)
      INSERT INTO unit_advice (advice_id, unit_id)
      VALUES 
        ('adv2', '3'),
        ('adv2', '4'),
        ('adv2', '5');

      -- 4. Create Waybill and Cycle through Statuses to populate SCD2 History
      INSERT INTO waybills (id, advice_id, status, origin, destination, client, truck, driver)
      VALUES ('wb2', 'adv2', 'LOADING', 'Batangas Port', 'Davao Depot', 'Client Beta', 'XYZ-9876', 'Jose Rizal');

      -- Simulating the Physical Movement
      -- Departure Scan
      INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type) 
      VALUES ('wb2', '3', 'DEPARTURE'), ('wb2', '4', 'DEPARTURE'), ('wb2', '5', 'DEPARTURE');

      UPDATE waybills SET status = 'IN_TRANSIT' WHERE id = 'wb2';
      UPDATE units SET status = 'IN_TRANSIT', current_location = 'XYZ-9876' WHERE id IN ('3', '4', '5');

      -- Arrival Scan
      INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type) 
      VALUES ('wb2', '3', 'ARRIVAL'), ('wb2', '4', 'ARRIVAL'), ('wb2', '5', 'ARRIVAL');

      UPDATE waybills SET status = 'ARRIVED' WHERE id = 'wb2';
      UPDATE units SET status = 'IN_STORAGE', current_location = 'Davao Depot' WHERE id IN ('3', '4', '5');

      -- Final Closure
      UPDATE waybills SET status = 'CLOSED' WHERE id = 'wb2';
      
    `);

    console.log("✨ Smart Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err.stack);
    process.exit(1);
  }
};

seedDatabase();
