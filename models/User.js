// Load the shared PostgreSQL pool.
const db = require("../database/connect");

// Find a user by normalized email address.
exports.findByEmail = async (email) => {
  const normalized = String(email || "").trim().toLowerCase();
  const result = await db.query("SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1", [normalized]);
  return result.rows[0] || null;
};

// Find a user by primary key.
exports.findById = async (id) => {
  const result = await db.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
  return result.rows[0] || null;
};

// Create a user account record.
exports.create = async ({ fullName, email, passwordHash, country }) => {
  const normalized = String(email).trim().toLowerCase();
  const result = await db.query(
    `INSERT INTO users (full_name, email, password_hash, country)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [fullName.trim(), normalized, passwordHash, country || null]
  );
  return result.rows[0];
};
