const db = require("./config/db");

const seedDatabase = async () => {
  try {
    console.log("🚀 Initializing Database Schema & Seed...");

    // 1. DROP EXISTING TABLES (In reverse order of dependency)
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
    `);
    console.log("🗑️  Old tables dropped.");

    // 2. CREATE TABLES
    await db.query(`
      CREATE TABLE units (
        engine VARCHAR(50) PRIMARY KEY,
        frame VARCHAR(50) NOT NULL,
        model VARCHAR(100),
        color VARCHAR(50),
        status VARCHAR(20) DEFAULT 'AVAILABLE'
      );

      CREATE TABLE waybills (
        id VARCHAR(100) PRIMARY KEY, -- Smart ID: ORIG-DEST-YYYYMMDD-SEQ
        status VARCHAR(20),
        origin VARCHAR(50),
        destination VARCHAR(50),
        client VARCHAR(100)
      );

      CREATE TABLE waybill_logs (
        id VARCHAR(150) PRIMARY KEY, -- Smart ID: WAYBILL_ID-STATUS
        waybill_id VARCHAR(100) REFERENCES waybills(id) ON DELETE CASCADE,
        status VARCHAR(20),          -- e.g., 'DEPARTURE', 'ARRIVAL'
        driver VARCHAR(100),
        truck VARCHAR(50),
        quantity INTEGER DEFAULT 0,  -- The actual quantity being moved
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE wb_advice (
        id SERIAL PRIMARY KEY,
        waybill_id VARCHAR(100) REFERENCES waybills(id) ON DELETE CASCADE,
        expected_qty INTEGER DEFAULT 0,
        expected_date TIMESTAMP
      );

      CREATE TABLE waybill_scans (
        id SERIAL PRIMARY KEY,
        waybill_log_id VARCHAR(150) REFERENCES waybill_logs(id) ON DELETE CASCADE,
        scan VARCHAR(50),
        status VARCHAR(20),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. INSERT YOUR SPECIFIC UNIT DATA
    await db.query(`
      INSERT INTO units (engine, frame, model, color) VALUES
      ('JA69ED080239', 'K2VS1020393', 'ACB125CBFTIV', 'PG'),
      ('JA69ED080240', 'K2VS1020394', 'ACB125CBFTIV', 'BK')
    `);

    // 4. GENERATE SMART WAYBILL ID
    // Format: [Origin]-[Dest]-[Date]-[Sequence]
    const wbId = "LAG-MNL-20260302-001";

    await db.query(
      `
        INSERT INTO waybills (id, status, origin, destination, client)
        VALUES ($1, 'IN_TRANSIT', 'LAGUNA', 'MANILA', 'HONDA PH')
      `,
      [wbId],
    );

    // 5. GENERATE SMART LOG ID
    const logStatus = "DEPARTURE";
    const logId = `${wbId}-${logStatus}`; 
    const actualQty = 8; 

    // 2. Run the query
    await db.query(
      `
        INSERT INTO waybill_logs (id, waybill_id, status, driver, truck, quantity)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [logId, wbId, logStatus, "Ricardo Dalisay", "TRK-HINO-99", actualQty],
    );

    // 6. INSERT ADVICE
    await db.query(`
      INSERT INTO wb_advice (waybill_id, expected_qty) 
      VALUES ('LAG-MNL-20260302-001', 10)
    `);

    // 7. INSERT WAYBILL SCANS
    await db.query(
      `
      INSERT INTO waybill_scans (waybill_log_id, scan, status)
      VALUES 
      ($1, 'JA69ED080239', 'MATCHED'),
      ($1, 'JA69ED080240', 'MATCHED')
    `,
      [logId],
    );

    console.log("✨ Smart Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err.stack);
    process.exit(1);
  }
};

seedDatabase();
