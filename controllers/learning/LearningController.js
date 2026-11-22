// Load the PostgreSQL pool.
const db = require("../../database/connect");

// Search and list published learning resources.
exports.list = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const result = search
      ? await db.query(
          `SELECT * FROM learning_resources WHERE status='published'
           AND (title ILIKE $1 OR description ILIKE $1 OR category ILIKE $1)
           ORDER BY published_at DESC`,
          [`%${search}%`]
        )
      : await db.query("SELECT * FROM learning_resources WHERE status='published' ORDER BY published_at DESC");
    return res.json({ resources: result.rows });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load learning resources." });
  }
};

// Retrieve one published learning resource.
exports.get = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM learning_resources WHERE id=$1 AND status='published' LIMIT 1",
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Learning resource was not found." });
    return res.json({ resource: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Unable to retrieve the learning resource." });
  }
};

// Update learning progress for the authenticated user.
exports.progress = async (req, res) => {
  try {
    const percent = Math.max(0, Math.min(100, Number(req.body.progressPercent || 0)));
    const status = percent >= 100 ? "completed" : "in_progress";
    const result = await db.query(
      `INSERT INTO learning_progress (user_id,resource_id,status,progress_percent)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id,resource_id)
       DO UPDATE SET status=$3, progress_percent=$4, updated_at=NOW() RETURNING *`,
      [req.session.user.id, req.params.id, status, percent]
    );
    return res.json({ progress: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Unable to update learning progress." });
  }
};

// Save a learning resource for later review.
exports.save = async (req, res) => {
  try {
    const result = await db.query(
      `INSERT INTO learning_progress (user_id,resource_id,status,progress_percent)
       VALUES ($1,$2,'saved',0)
       ON CONFLICT (user_id,resource_id)
       DO UPDATE SET status='saved', updated_at=NOW() RETURNING *`,
      [req.session.user.id, req.params.id]
    );
    return res.json({ progress: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Unable to save the learning resource." });
  }
};
