// Load the PostgreSQL pool.
const db = require("../../database/connect");

// List notifications for the authenticated user.
exports.list = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100",
      [req.session.user.id]
    );
    return res.json({ notifications: result.rows });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load notifications." });
  }
};

// Mark one notification as read.
exports.read = async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE notifications SET read_at=COALESCE(read_at,NOW()) WHERE id=$1 AND user_id=$2 RETURNING *",
      [req.params.id, req.session.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Notification was not found." });
    return res.json({ notification: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Unable to update the notification." });
  }
};

// Delete one notification owned by the user.
exports.remove = async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM notifications WHERE id=$1 AND user_id=$2 RETURNING id",
      [req.params.id, req.session.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Notification was not found." });
    return res.json({ message: "Notification deleted." });
  } catch (error) {
    return res.status(500).json({ error: "Unable to delete the notification." });
  }
};
