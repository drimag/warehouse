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
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
        status VARCHAR(50),
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
        history_id UUID PRIMARY KEY,
        unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
        engine VARCHAR(50) UNIQUE,
        frame VARCHAR(50) UNIQUE,
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
        history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
        unit_id UUID REFERENCES units(id),
        manifest_type TEXT NOT NULL, 
        user_id VARCHAR(100), -- subject to change
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE TABLE unit_advice (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        advice_id VARCHAR(100) REFERENCES waybill_advice(id) ON DELETE CASCADE,
        unit_id UUID REFERENCES units(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    console.log("✨ Smart Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err.stack);
    process.exit(1);
  }
};

seedDatabase();
