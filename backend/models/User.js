const db = require("../config/db");

const User = {};

User.findByEmail = async (email) => {
  const [result] = await db.execute("SELECT * FROM users WHERE email = ?", [
    email.toLowerCase().trim(),
  ]);
  return result;
};

User.create = async ({ name, email, passwordHash, role = "VIEWER" }) => {
  const [result] = await db.execute(
    `INSERT INTO users (name, email, password_hash, role) 
     VALUES (?, ?, ?, ?) 
     RETURNING id, name, email, role`,
    [name, email.toLowerCase().trim(), passwordHash, role],
  );
  if (result.affectedRows === 0) {
    throw new Error("Failed to Insert New User");
  }
  return { success: true, email: email };
};

module.exports = User;
