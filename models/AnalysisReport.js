// Load the PostgreSQL pool.
const db = require("../database/connect");

// Create a report for an authenticated user.
exports.create = async (payload) => {
  const result = await db.query(
    `INSERT INTO analysis_reports
     (user_id, session_id, platform, asset, timeframe, report_content, recognition_confidence, model_version, data_sources)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [payload.userId, payload.sessionId || null, payload.platform, payload.asset, payload.timeframe,
     payload.reportContent, payload.confidence, payload.modelVersion || "v1", payload.dataSources || ["screenshot"]]
  );
  return result.rows[0];
};

// List reports belonging to one user.
exports.listByUser = async (userId) => {
  const result = await db.query(
    "SELECT * FROM analysis_reports WHERE user_id=$1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
};

// Find one report only when it belongs to the user.
exports.findByUser = async (id, userId) => {
  const result = await db.query(
    "SELECT * FROM analysis_reports WHERE id=$1 AND user_id=$2 LIMIT 1",
    [id, userId]
  );
  return result.rows[0] || null;
};

// Delete a report owned by the user.
exports.removeByUser = async (id, userId) => {
  const result = await db.query(
    "DELETE FROM analysis_reports WHERE id=$1 AND user_id=$2 RETURNING id",
    [id, userId]
  );
  return result.rows[0] || null;
};
