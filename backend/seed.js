const db = require("./config/db");

const seedDatabase = async () => {
  try {
    console.log("🚀 Initializing Database Schema & Seed...");

    await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

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
      DROP TABLE IF EXISTS users CASCADE;
      DROP SEQUENCE IF EXISTS waybill_code_seq CASCADE;
      DROP TYPE IF EXISTS user_role CASCADE;
    `);
    console.log("🗑️ Old tables dropped.");

    await db.query(`
      CREATE SEQUENCE waybill_code_seq;  
    `);

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
      CREATE TYPE user_role AS ENUM ('ADMIN', 'SCANNER', 'VIEWER');

      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255), -- Nullable if authenticating via Google OAuth integration
          role user_role DEFAULT 'VIEWER',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS units (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        engine VARCHAR(50) UNIQUE,
        frame VARCHAR(50) UNIQUE,
        model VARCHAR(50),
        color VARCHAR(50),
        status VARCHAR(50) DEFAULT 'IN_STORAGE' NOT NULL,
        da VARCHAR(50),  
        last_location_id INT REFERENCES locations(id), 
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS waybills (
        id VARCHAR(100) PRIMARY KEY, -- Smart ID: YYYYMMDD-CLIE-XXXX
        status VARCHAR(50),
        origin_id INT REFERENCES locations(id),
        destination_id INT REFERENCES locations(id),
        client VARCHAR(100),
        truck_id INT REFERENCES trucks(id),
        driver_id INT REFERENCES drivers(id),
        expected_quantity INTEGER,
        expected_arrival TIMESTAMP WITH TIME ZONE,
        departure_photo_url TEXT,
        arrival_photo_url TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        loading_started_at TIMESTAMP WITH TIME ZONE
      );

      -- for fast lookup
      CREATE INDEX idx_waybills_status ON waybills(status);
      -- WHERE status = 'LOADING'; (can ignore wbs with other statuses)

      -- Selective SCD2 Implementation
      CREATE TABLE IF NOT EXISTS unit_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
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
        client VARCHAR(100),
        truck_id INT REFERENCES trucks(id),
        driver_id INT REFERENCES drivers(id),
        expected_quantity INTEGER,
        expected_arrival TIMESTAMP WITH TIME ZONE,
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
        metadata JSONB DEFAULT '{}'::jsonb,
        description TEXT
      );

      -- Join Tables
      CREATE TABLE IF NOT EXISTS waybill_manifest (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        waybill_id VARCHAR(100) REFERENCES waybills(id) ON DELETE CASCADE,
        unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
        manifest_type VARCHAR(50) NOT NULL, 
        user_id VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    await db.query(`
      DROP TRIGGER IF EXISTS on_waybill_update ON waybills; 
      DROP TRIGGER IF EXISTS on_unit_update ON units;
    `);
    console.log("🗑️ Old triggers dropped.");

    await db.query(`
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
      `);

    await db.query(`
      CREATE OR REPLACE FUNCTION handle_waybill_scd2()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE waybill_history
        SET eff_end = now(),
            is_current = FALSE
        WHERE waybill_id = NEW.id AND is_current = TRUE;

        INSERT INTO waybill_history (
          waybill_id, 
          status, 
          origin_id, 
          destination_id, 
          client,
          truck_id, 
          driver_id, 
          expected_quantity,
          expected_arrival,
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
          NEW.client,
          NEW.truck_id, 
          NEW.driver_id, 
          NEW.expected_quantity,
          NEW.expected_arrival,
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
      AFTER INSERT OR UPDATE OF id, status, origin_id, destination_id, client, truck_id, driver_id, expected_quantity, expected_arrival ON waybills
      FOR EACH ROW 
      EXECUTE FUNCTION handle_waybill_scd2();
    `);

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

      -- (Password: AdminSecret123!)
      INSERT INTO users (name, email, password_hash, role) 
      VALUES (
        'System Admin', 
        'admin@company.com', 
        '$2b$10$RuO9.TMUxYOoppLVCLm3ZeYXN7OeRxq7NCLFDef9K.tudwhAUURg2',
        'ADMIN'
      );

      -- Hash for 'password123'
      INSERT INTO users (name, email, password_hash, role) 
      VALUES (
        'Sam Scanner', 
        'scanner@company.com', 
        '$2b$10$ecvCQyPLB5BPUHYXPQKO0e5od6BAhv3.e8zbLqs.qzMvs4Y2cv2LW', 
        'SCANNER'
      );

      -- Hash for 'password123'
      INSERT INTO users (name, email, password_hash, role) 
      VALUES (
        'Valerie Viewer', 
        'viewer@company.com', 
        '$2b$10$ecvCQyPLB5BPUHYXPQKO0e5od6BAhv3.e8zbLqs.qzMvs4Y2cv2LW',
        'VIEWER'
      );
      `);

    await db.query(`
      -- 1. Create 2 Units (Started as IN_STORAGE)
      INSERT INTO units (engine, frame, model, color, status, last_location_id)
      VALUES 
        ('ENG-P1-001', 'FRM-P1-001', 'Model1', 'RD', 'IN_STORAGE', 1),
        ('ENG-P1-002', 'FRM-P1-002', 'Model1', 'RD', 'IN_STORAGE', 1);
    `);
    await db.query(`
      -- 2. Create the "Advice" record directly in the Waybills table
      INSERT INTO waybills (id, status, origin_id, destination_id, client, truck_id, driver_id, expected_quantity)
      VALUES ('wb1', 'ADVICE', 1, 2, 'Client Alpha', 1, 1, 2);

      -- 3. expected units
      INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type) 
      VALUES 
        (
          'wb1', 
          (SELECT id FROM units WHERE engine = 'ENG-P1-001' LIMIT 1), 
          'ADVICE'
        ),
        (
          'wb1', 
          (SELECT id FROM units WHERE engine = 'ENG-P1-002' LIMIT 1), 
          'ADVICE'
        );
      `);

    await db.query(`
      INSERT INTO units (engine, frame, model, color, status, last_location_id)
      VALUES 
        ('ENG-P2-003', 'FRM-P2-003', 'Model2', 'BL', 'IN_STORAGE', 2),
        ('ENG-P2-004', 'FRM-P2-004', 'Model2', 'BL', 'IN_STORAGE', 2),
        ('ENG-P2-005', 'FRM-P2-005', 'Model2', 'BL', 'IN_STORAGE', 2);
        `);
    await db.query(`
      INSERT INTO waybills (id, status, origin_id, destination_id, client, truck_id, driver_id)
      VALUES ('wb2', 'ADVICE', 2, 3, 'Client Beta', 2, 2);
      INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type) 
      VALUES 
        (
          'wb2', 
          (SELECT id FROM units WHERE engine = 'ENG-P2-003' LIMIT 1), 
          'ADVICE'
        ), 
        (
          'wb2', 
          (SELECT id FROM units WHERE engine = 'ENG-P2-004' LIMIT 1), 
          'ADVICE'
        ), 
        (
          'wb2', 
          (SELECT id FROM units WHERE engine = 'ENG-P2-003' LIMIT 1), 
          'ADVICE'
        );

      UPDATE waybills SET status = 'LOADING' WHERE id = 'wb2';

      UPDATE waybills SET status = 'IN_TRANSIT' WHERE id = 'wb2';
      UPDATE units 
      SET status = 'IN_TRANSIT' 
      WHERE engine IN ('ENG-P2-003', 'ENG-P2-004', 'ENG-P2-005');

      INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type) 
      VALUES 
        (
          'wb2', 
          (SELECT id FROM units WHERE engine = 'ENG-P2-003' LIMIT 1), 
          'DEPARTURE'
        ), 
        (
          'wb2', 
          (SELECT id FROM units WHERE engine = 'ENG-P2-004' LIMIT 1), 
          'DEPARTURE'
        ), 
        (
          'wb2', 
          (SELECT id FROM units WHERE engine = 'ENG-P2-003' LIMIT 1), 
          'DEPARTURE'
        );

      `);
    await db.query(`
      UPDATE waybills SET status = 'ARRIVED' WHERE id = 'wb2';
      UPDATE units SET status = 'IN_STORAGE', last_location_id = 3 WHERE engine IN ('ENG-P2-003', 'ENG-P2-004', 'ENG-P2-005');

      INSERT INTO waybill_manifest (waybill_id, unit_id, manifest_type) 
      VALUES 
        (
          'wb2', 
          (SELECT id FROM units WHERE engine = 'ENG-P2-003' LIMIT 1), 
          'ARRIVAL'
        ), 
        (
          'wb2', 
          (SELECT id FROM units WHERE engine = 'ENG-P2-004' LIMIT 1), 
          'ARRIVAL'
        ), 
        (
          'wb2', 
          (SELECT id FROM units WHERE engine = 'ENG-P2-003' LIMIT 1), 
          'ARRIVAL'
        );

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
