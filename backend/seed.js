const db = require("./config/db");

const seedDatabase = async () => {
  try {
    console.log("🚀 Initializing Database Schema & Seed...");

    // Drop all tables (MySQL syntax - no CASCADE needed)
    await db.query(`
      DROP TABLE IF EXISTS waybill_manifest;
      DROP TABLE IF EXISTS waybill_logs;
      DROP TABLE IF EXISTS unit_scans;
      DROP TABLE IF EXISTS waybill_scans;
      DROP TABLE IF EXISTS unit_advice;
      DROP TABLE IF EXISTS waybill_advice;
      DROP TABLE IF EXISTS activity_logs;
      DROP TABLE IF EXISTS waybill_history;
      DROP TABLE IF EXISTS unit_history;
      DROP TABLE IF EXISTS waybill_logs;
      DROP TABLE IF EXISTS waybills;
      DROP TABLE IF EXISTS units;
      DROP TABLE IF EXISTS unit_logs;
      DROP TABLE IF EXISTS warehouses;
      DROP TABLE IF EXISTS clients;
      DROP TABLE IF EXISTS trucks;
      DROP TABLE IF EXISTS drivers;
      DROP TABLE IF EXISTS locations;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS waybill_counters;
    `);
    console.log("🗑️ Old tables dropped.");

    // Create waybill_counters table
    await db.query(`
      CREATE TABLE IF NOT EXISTS waybill_counters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date_created DATE NOT NULL,
        counter INT DEFAULT 0,
        UNIQUE KEY idx_date (date_created)
      );
    `);

    // Create base tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS trucks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plate_number VARCHAR(20) UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS drivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL
      );
    `);

    // Create users table (use VARCHAR instead of ENUM for role)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        role VARCHAR(50) DEFAULT 'VIEWER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Create units table (use CHAR(36) for UUID simulation)
    await db.query(`
      CREATE TABLE IF NOT EXISTS units (
        id CHAR(36) PRIMARY KEY,
        engine VARCHAR(50) UNIQUE,
        frame VARCHAR(50) UNIQUE,
        model VARCHAR(50),
        color VARCHAR(50),
        status VARCHAR(50) DEFAULT 'IN_STORAGE' NOT NULL,
        da VARCHAR(50),
        last_location_id INT REFERENCES locations(id),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Create waybills table
    await db.query(`
      CREATE TABLE IF NOT EXISTS waybills (
        id VARCHAR(100) PRIMARY KEY,
        status VARCHAR(50),
        origin_id INT REFERENCES locations(id),
        destination_id INT REFERENCES locations(id),
        client VARCHAR(100),
        truck_id INT REFERENCES trucks(id),
        driver_id INT REFERENCES drivers(id),
        expected_quantity INTEGER,
        expected_arrival TIMESTAMP,
        departure_photo_url TEXT,
        arrival_photo_url TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        loading_started_at TIMESTAMP,
        INDEX idx_waybills_status (status)
      );
    `);

    // Create unit_history table
    await db.query(`
      CREATE TABLE IF NOT EXISTS unit_history (
        id CHAR(36) PRIMARY KEY,
        unit_id CHAR(36) NOT NULL,
        engine VARCHAR(50),
        frame VARCHAR(50),
        model VARCHAR(50),
        color VARCHAR(50),
        status VARCHAR(50),
        da VARCHAR(50),
        last_location_id INT,
        eff_start TIMESTAMP NOT NULL,
        eff_end TIMESTAMP,
        is_current BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
        FOREIGN KEY (last_location_id) REFERENCES locations(id),
        INDEX idx_unit_id_current (unit_id, is_current)
      );
    `);

    // Create waybill_history table
    await db.query(`
      CREATE TABLE IF NOT EXISTS waybill_history (
        id CHAR(36) PRIMARY KEY,
        waybill_id VARCHAR(100) NOT NULL,
        status VARCHAR(50),
        origin_id INT,
        destination_id INT,
        client VARCHAR(100),
        truck_id INT,
        driver_id INT,
        expected_quantity INTEGER,
        expected_arrival TIMESTAMP,
        departure_photo_url TEXT,
        arrival_photo_url TEXT,
        eff_start TIMESTAMP NOT NULL,
        eff_end TIMESTAMP,
        is_current BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (waybill_id) REFERENCES waybills(id) ON DELETE CASCADE,
        FOREIGN KEY (origin_id) REFERENCES locations(id),
        FOREIGN KEY (destination_id) REFERENCES locations(id),
        FOREIGN KEY (truck_id) REFERENCES trucks(id),
        FOREIGN KEY (driver_id) REFERENCES drivers(id),
        INDEX idx_waybill_id_current (waybill_id, is_current)
      );
    `);

    // Create activity_logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id CHAR(36) PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id VARCHAR(100),
        entity_type VARCHAR(100) NOT NULL,
        entity_id CHAR(36) NOT NULL,
        event_type TEXT NOT NULL,
        metadata JSON DEFAULT NULL,
        description TEXT,
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_created_at (created_at)
      );
    `);

    // Create waybill_manifest table
    await db.query(`
      CREATE TABLE IF NOT EXISTS waybill_manifest (
        id CHAR(36) PRIMARY KEY,
        waybill_id VARCHAR(100) NOT NULL,
        unit_id CHAR(36),
        manifest_type VARCHAR(50) NOT NULL,
        user_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (waybill_id) REFERENCES waybills(id) ON DELETE CASCADE,
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
      );
    `);

    console.log("🗑️ Old triggers dropped (not needed in MySQL version).");

    // MySQL Trigger for unit SCD2 - AFTER INSERT
    await db.query(`
      CREATE TRIGGER on_unit_insert
      AFTER INSERT ON units
      FOR EACH ROW
      BEGIN
        INSERT INTO unit_history (
          id, unit_id, engine, frame, model, color, status, da, last_location_id, eff_start, is_current
        )
        VALUES (
          UUID(), NEW.id, NEW.engine, NEW.frame, NEW.model, NEW.color, NEW.status, NEW.da, NEW.last_location_id, NOW(), TRUE
        );
      END;
    `);

    // MySQL Trigger for unit SCD2 - AFTER UPDATE
    await db.query(`
      CREATE TRIGGER on_unit_update
      AFTER UPDATE ON units
      FOR EACH ROW
      BEGIN
        UPDATE unit_history
        SET eff_end = NOW(),
            is_current = FALSE
        WHERE unit_id = NEW.id AND is_current = TRUE;

        INSERT INTO unit_history (
          id, unit_id, engine, frame, model, color, status, da, last_location_id, eff_start, is_current
        )
        VALUES (
          UUID(), NEW.id, NEW.engine, NEW.frame, NEW.model, NEW.color, NEW.status, NEW.da, NEW.last_location_id, NOW(), TRUE
        );
      END;
    `);

    // MySQL Trigger for waybill SCD2 - AFTER INSERT
    await db.query(`
      CREATE TRIGGER on_waybill_insert
      AFTER INSERT ON waybills
      FOR EACH ROW
      BEGIN
        INSERT INTO waybill_history (
          id, waybill_id, status, origin_id, destination_id, client, truck_id, driver_id,
          expected_quantity, expected_arrival, departure_photo_url, arrival_photo_url, eff_start, is_current
        )
        VALUES (
          UUID(), NEW.id, NEW.status, NEW.origin_id, NEW.destination_id, NEW.client,
          NEW.truck_id, NEW.driver_id, NEW.expected_quantity, NEW.expected_arrival,
          NEW.departure_photo_url, NEW.arrival_photo_url, NOW(), TRUE
        );
      END;
    `);

    // MySQL Trigger for waybill SCD2 - AFTER UPDATE
    await db.query(`
      CREATE TRIGGER on_waybill_update
      AFTER UPDATE ON waybills
      FOR EACH ROW
      BEGIN
        UPDATE waybill_history
        SET eff_end = NOW(),
            is_current = FALSE
        WHERE waybill_id = NEW.id AND is_current = TRUE;

        INSERT INTO waybill_history (
          id, waybill_id, status, origin_id, destination_id, client, truck_id, driver_id,
          expected_quantity, expected_arrival, departure_photo_url, arrival_photo_url, eff_start, is_current
        )
        VALUES (
          UUID(), NEW.id, NEW.status, NEW.origin_id, NEW.destination_id, NEW.client,
          NEW.truck_id, NEW.driver_id, NEW.expected_quantity, NEW.expected_arrival,
          NEW.departure_photo_url, NEW.arrival_photo_url, NOW(), TRUE
        );
      END;
    `);

    // Seed locations
    await db.query(`
      INSERT INTO locations (id, name, type) 
      VALUES
        (1, 'Central Hub - Makati', 'WAREHOUSE'),
        (2, 'North Luzon Depot', 'WAREHOUSE'),
        (3, 'Cebu Distribution Center', 'WAREHOUSE'),
        (4, 'Sta. Rosa Main Plant', 'PLANT'),
        (5, 'End Consumer / Dealer', 'CONSUMER')
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name), 
        type = VALUES(type);
    `);

    // Seed trucks
    await db.query(`
      INSERT INTO trucks (id, plate_number) 
      VALUES
        (1, 'NBD-1234'),
        (2, 'RVM-5678'),
        (3, 'WMS-9012'),
        (4, 'TBA-0000')
      ON DUPLICATE KEY UPDATE 
        plate_number = VALUES(plate_number);
    `);

    // Seed drivers
    await db.query(`
      INSERT INTO drivers (id, full_name) 
      VALUES
        (1, 'Ricardo Dalisay'),
        (2, 'Juan Dela Cruz'),
        (3, 'Maria Clara')
      ON DUPLICATE KEY UPDATE 
        full_name = VALUES(full_name);
    `);

    // Seed users
    await db.query(`
      INSERT INTO users (name, email, password_hash, role) 
      VALUES (
        'System Admin', 
        'admin@company.com', 
        '$2b$10$RuO9.TMUxYOoppLVCLm3ZeYXN7OeRxq7NCLFDef9K.tudwhAUURg2',
        'ADMIN'
      )
      ON DUPLICATE KEY UPDATE 
        password_hash = VALUES(password_hash),
        role = VALUES(role);
    `);

    await db.query(`
      INSERT INTO users (name, email, password_hash, role) 
      VALUES (
        'Sam Scanner', 
        'scanner@company.com', 
        '$2b$10$ecvCQyPLB5BPUHYXPQKO0e5od6BAhv3.e8zbLqs.qzMvs4Y2cv2LW', 
        'SCANNER'
      )
      ON DUPLICATE KEY UPDATE 
        password_hash = VALUES(password_hash),
        role = VALUES(role);
    `);

    await db.query(`
      INSERT INTO users (name, email, password_hash, role) 
      VALUES (
        'Valerie Viewer', 
        'viewer@company.com', 
        '$2b$10$ecvCQyPLB5BPUHYXPQKO0e5od6BAhv3.e8zbLqs.qzMvs4Y2cv2LW',
        'VIEWER'
      )
      ON DUPLICATE KEY UPDATE 
        password_hash = VALUES(password_hash),
        role = VALUES(role);
    `);

    // Seed units and waybills for test data
    const connection = await db.getConnection();
    try {
      // Generate UUIDs using MySQL's UUID() function in the database
      const uuid1Result = await connection.query('SELECT UUID() as id');
      const uuid2Result = await connection.query('SELECT UUID() as id');
      const uuid3Result = await connection.query('SELECT UUID() as id');
      const uuid4Result = await connection.query('SELECT UUID() as id');
      const uuid5Result = await connection.query('SELECT UUID() as id');

      const unit1_id = uuid1Result[0][0].id;
      const unit2_id = uuid2Result[0][0].id;
      const unit3_id = uuid3Result[0][0].id;
      const unit4_id = uuid4Result[0][0].id;
      const unit5_id = uuid5Result[0][0].id;

      // Create 2 Units (Started as IN_STORAGE)
      await connection.query(`
        INSERT INTO units (id, engine, frame, model, color, status, last_location_id)
        VALUES 
          (?, 'ENG-P1-001', 'FRM-P1-001', 'Model1', 'RD', 'IN_STORAGE', 1),
          (?, 'ENG-P1-002', 'FRM-P1-002', 'Model1', 'RD', 'IN_STORAGE', 1)
      `, [unit1_id, unit2_id]);

      // Create the "Advice" waybill
      await connection.query(`
        INSERT INTO waybills (id, status, origin_id, destination_id, client, truck_id, driver_id, expected_quantity)
        VALUES ('wb1', 'ADVICE', 1, 2, 'Client Alpha', 1, 1, 2)
      `);

      // Add units to waybill manifest
      await connection.query(`
        INSERT INTO waybill_manifest (id, waybill_id, unit_id, manifest_type) 
        VALUES 
          (UUID(), 'wb1', ?, 'ADVICE'),
          (UUID(), 'wb1', ?, 'ADVICE')
      `, [unit1_id, unit2_id]);

      // Create 3 more units
      await connection.query(`
        INSERT INTO units (id, engine, frame, model, color, status, last_location_id)
        VALUES 
          (?, 'ENG-P2-003', 'FRM-P2-003', 'Model2', 'BL', 'IN_STORAGE', 2),
          (?, 'ENG-P2-004', 'FRM-P2-004', 'Model2', 'BL', 'IN_STORAGE', 2),
          (?, 'ENG-P2-005', 'FRM-P2-005', 'Model2', 'BL', 'IN_STORAGE', 2)
      `, [unit3_id, unit4_id, unit5_id]);

      // Create second waybill
      await connection.query(`
        INSERT INTO waybills (id, status, origin_id, destination_id, client, truck_id, driver_id)
        VALUES ('wb2', 'ADVICE', 2, 3, 'Client Beta', 2, 2)
      `);

      // Add units to second waybill manifest (ADVICE phase)
      await connection.query(`
        INSERT INTO waybill_manifest (id, waybill_id, unit_id, manifest_type) 
        VALUES 
          (UUID(), 'wb2', ?, 'ADVICE'),
          (UUID(), 'wb2', ?, 'ADVICE'),
          (UUID(), 'wb2', ?, 'ADVICE')
      `, [unit3_id, unit4_id, unit3_id]);

      // Transition wb2 through loading states
      await connection.query(`UPDATE waybills SET status = 'LOADING' WHERE id = 'wb2'`);
      await connection.query(`UPDATE waybills SET status = 'IN_TRANSIT' WHERE id = 'wb2'`);

      await connection.query(`
        UPDATE units 
        SET status = 'IN_TRANSIT' 
        WHERE engine IN ('ENG-P2-003', 'ENG-P2-004', 'ENG-P2-005')
      `);

      // Add DEPARTURE manifest entries
      await connection.query(`
        INSERT INTO waybill_manifest (id, waybill_id, unit_id, manifest_type) 
        VALUES 
          (UUID(), 'wb2', ?, 'DEPARTURE'),
          (UUID(), 'wb2', ?, 'DEPARTURE'),
          (UUID(), 'wb2', ?, 'DEPARTURE')
      `, [unit3_id, unit4_id, unit3_id]);

      // Transition to ARRIVED
      await connection.query(`UPDATE waybills SET status = 'ARRIVED' WHERE id = 'wb2'`);
      await connection.query(`
        UPDATE units 
        SET status = 'IN_STORAGE', last_location_id = 3 
        WHERE engine IN ('ENG-P2-003', 'ENG-P2-004', 'ENG-P2-005')
      `);

      // Add ARRIVAL manifest entries
      await connection.query(`
        INSERT INTO waybill_manifest (id, waybill_id, unit_id, manifest_type) 
        VALUES 
          (UUID(), 'wb2', ?, 'ARRIVAL'),
          (UUID(), 'wb2', ?, 'ARRIVAL'),
          (UUID(), 'wb2', ?, 'ARRIVAL')
      `, [unit3_id, unit4_id, unit3_id]);

      // Final transition to CLOSED
      await connection.query(`UPDATE waybills SET status = 'CLOSED' WHERE id = 'wb2'`);

    } finally {
      connection.release();
    }

    console.log("✨ Smart Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err.stack);
    process.exit(1);
  }
};

seedDatabase();