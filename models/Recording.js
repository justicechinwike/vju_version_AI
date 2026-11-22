// Load the PostgreSQL pool.
const db = require("../database/connect");

// Create a recording session.
exports.create = async (payload) => {
  const result = await db.query(
    `INSERT INTO recordings
     (user_id,name,mode,status,resolution,frame_rate,audio_config,duration_seconds,started_at)
     VALUES ($1,$2,$3,'recording',$4,$5,$6,0,NOW()) RETURNING *`,
    [payload.userId, payload.name || "Untitled recording", payload.mode,
     payload.resolution || "1080p", payload.frameRate || 30, payload.audioConfig || {}]
  );
  return result.rows[0];
};

// List recordings owned by the user.
exports.listByUser = async (userId) => {
  const result = await db.query("SELECT * FROM recordings WHERE user_id=$1 ORDER BY created_at DESC", [userId]);
  return result.rows;
};

// Stop a recording and set its completed duration.
exports.stopByUser = async (id, userId) => {
  const result = await db.query(
    `UPDATE recordings SET status='completed', ended_at=NOW(),
     duration_seconds=GREATEST(0, EXTRACT(EPOCH FROM (NOW()-started_at))::int)
     WHERE id=$1 AND user_id=$2 RETURNING *`,
    [id, userId]
  );
  return result.rows[0] || null;
};

// Rename a recording owned by the user.
exports.renameByUser = async (id, userId, name) => {
  const result = await db.query(
    "UPDATE recordings SET name=$3 WHERE id=$1 AND user_id=$2 RETURNING *",
    [id, userId, name]
  );
  return result.rows[0] || null;
};

// Delete a recording owned by the user.
exports.removeByUser = async (id, userId) => {
  const result = await db.query(
    "DELETE FROM recordings WHERE id=$1 AND user_id=$2 RETURNING id",
    [id, userId]
  );
  return result.rows[0] || null;
};
