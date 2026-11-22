// Load environment values before creating the PostgreSQL pool.
require("dotenv").config();
// Import the PostgreSQL client library.
const { Pool } = require("pg");

// Create one reusable connection pool for the whole application.
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "vju_vision_ai",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

// Verify connectivity during startup and log a useful diagnostic.
pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error.message);
});

// Export the pool for use by all application models.
module.exports = pool;
