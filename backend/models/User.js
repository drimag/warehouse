const db = require("../config/db");

const User = {};

User.findByEmail = async (email) => {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1', 
    [email.toLowerCase().trim()]
  );
  return result.rows[0];
};

User.create = async ({ name, email, passwordHash, role = 'VIEWER' }) => {
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, name, email, role`,
    [name, email.toLowerCase().trim(), passwordHash, role]
  );
  return result.rows[0];
};

module.exports = User;