// Load the PostgreSQL pool.
const db = require("../database/connect");

// Create a screen-assistance session.
exports.create = async (userId, captureSource) => {
  const result = await db.query(
    `INSERT INTO screen_sessions (user_id, capture_source, status)
     VALUES ($1,$2,'processing') RETURNING *`,
    [userId, captureSource]
  );
  return result.rows[0];
};

// Stop a screen-assistance session owned by the user.
exports.stopByUser = async (id, userId) => {
  const result = await db.query(
    `UPDATE screen_sessions SET status='completed', ended_at=NOW()
     WHERE id=$1 AND user_id=$2 RETURNING *`,
    [id, userId]
  );
  return result.rows[0] || null;
};
