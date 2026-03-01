// Example in index.js
// const app = require('./app');
const pool = require('./config/db');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to DB first, then start server
pool.connect()
  .then(() => {
    console.log("Database connected");
    // app.listen(PORT, () => console.log(`Server on ${PORT}`));
  })
  .catch(err => console.error("DB Connection failed", err));

async function inspectDatabase() {
  try {
    console.log("🔍 Inspecting Database Structure...");

    // This query pulls every table and its columns from your 'public' schema
    const query = `
      SELECT 
        table_name, 
        column_name, 
        data_type 
      FROM 
        information_schema.columns 
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name, ordinal_position;
    `;

    const res = await db.query(query);

    if (res.rows.length === 0) {
      console.log("⚠️ Connection successful, but the database is EMPTY (no tables found).");
    } else {
      console.log("✅ Database Structure Found:");
      
      // Grouping results by table name for a cleaner printout
      const structure = res.rows.reduce((acc, row) => {
        if (!acc[row.table_name]) acc[row.table_name] = [];
        acc[row.table_name].push(`${row.column_name} (${row.data_type})`);
        return acc;
      }, {});

      console.table(structure);
    }
  } catch (err) {
    console.error("❌ Failed to inspect database:", err.message);
  }
}

// Call it after your connection logic
inspectDatabase();