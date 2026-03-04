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

    // --- WAYBILL 1: COMPLETE CYCLE (DEPARTURE & ARRIVAL) ---
    const wbId1 = "LAG-MNL-20260305-001";

    // 1. Waybill Instance
    await db.query(
      `INSERT INTO waybills (id, status, origin, destination, client) VALUES ($1, 'ARRIVED', 'LAGUNA', 'MANILA', 'HONDA PH')`,
      [wbId1],
    );

    // 2. Advice
    await db.query(
      `INSERT INTO wb_advice (waybill_id, expected_qty) VALUES ($1, 5)`,
      [wbId1],
    );

    // 3. Departure Log
    const depLogId1 = `${wbId1}-DEPARTURE`;
    await db.query(
      `INSERT INTO waybill_logs (id, waybill_id, status, driver, truck, quantity) VALUES ($1, $2, 'DEPARTURE', $3, $4, 5)`,
      [depLogId1, wbId1, "Ricardo Dalisay", "TRK-HINO-99"],
    );

    // 4. Departure Scans (5 Units)
    const scanOutCodes = [
      "ENG-001",
      "ENG-002",
      "ENG-003",
      "ENG-004",
      "ENG-005",
    ];
    for (const code of scanOutCodes) {
      await db.query(
        `INSERT INTO waybill_scans (waybill_log_id, scan, status) VALUES ($1, $2, 'MATCHED')`,
        [depLogId1, code],
      );
    }

    // 5. Arrival Log
    const arrLogId1 = `${wbId1}-ARRIVAL`;
    await db.query(
      `INSERT INTO waybill_logs (id, waybill_id, status, driver, truck, quantity) VALUES ($1, $2, 'ARRIVAL', $3, $4, 5)`,
      [arrLogId1, wbId1, "Ricardo Dalisay", "TRK-HINO-99"],
    );

    // 6. Arrival Scans (5 Units - one marked as damaged)
    for (const [index, code] of scanOutCodes.entries()) {
      const status = index === 4 ? "PENDING" : "MATCHED"; // Example discrepancy
      await db.query(
        `INSERT INTO waybill_scans (waybill_log_id, scan, status) VALUES ($1, $2, $3)`,
        [arrLogId1, code, status],
      );
    }

    // --- WAYBILL 2: IN TRANSIT (DEPARTURE ONLY) ---
    const wbId2 = "BAT-SUB-20260305-002";

    await db.query(
      `INSERT INTO waybills (id, status, origin, destination, client) VALUES ($1, 'IN_TRANSIT', 'BATANGAS', 'SUBIC', 'TOYOTA PH')`,
      [wbId2],
    );

    await db.query(
      `INSERT INTO wb_advice (waybill_id, expected_qty) VALUES ($1, 3)`,
      [wbId2],
    );

    const depLogId2 = `${wbId2}-DEPARTURE`;
    await db.query(
      `INSERT INTO waybill_logs (id, waybill_id, status, driver, truck, quantity) VALUES ($1, $2, 'DEPARTURE', $3, $4, 3)`,
      [depLogId2, wbId2, "Cardo Dalisay", "TRK-ISUZU-01"],
    );

    // 3 Scans for this one
    const scanOutCodes2 = ["TRS-991", "TRS-992", "TRS-993"];
    for (const code of scanOutCodes2) {
      await db.query(
        `INSERT INTO waybill_scans (waybill_log_id, scan, status) VALUES ($1, $2, 'MATCHED')`,
        [depLogId2, code],
      );
    }

    console.log("✨ Smart Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err.stack);
    process.exit(1);
  }
};

seedDatabase();
