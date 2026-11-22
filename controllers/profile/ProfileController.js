// Load the PostgreSQL pool.
const db = require("../../database/connect");

// Retrieve permitted profile information.
exports.get = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id,full_name,email,country,preferred_language,role,status,mfa_enabled,notification_preferences,created_at FROM users WHERE id=$1",
      [req.session.user.id]
    );
    return res.json({ profile: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load profile information." });
  }
};

// Update permitted profile fields.
exports.update = async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    if (!fullName) return res.status(400).json({ error: "Full name is required." });
    const result = await db.query(
      `UPDATE users SET full_name=$2,country=$3,preferred_language=$4,
       notification_preferences=$5,updated_at=NOW() WHERE id=$1
       RETURNING id,full_name,email,country,preferred_language,notification_preferences`,
      [req.session.user.id, fullName, req.body.country || null,
       req.body.preferredLanguage || "en", req.body.notificationPreferences || {}]
    );
    req.session.user.fullName = result.rows[0].full_name;
    return res.json({ profile: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Unable to update profile information." });
  }
};

// Record an account-deletion request for authorized processing.
exports.deleteRequest = async (req, res) => {
  try {
    await db.query(
      "INSERT INTO audit_logs (actor_user_id,action,entity,details) VALUES ($1,'account_deletion_requested','user',$2)",
      [req.session.user.id, JSON.stringify({ reason: req.body.reason || "user_request" })]
    );
    return res.json({ message: "Account deletion request recorded. Essential records may be retained where legally required." });
  } catch (error) {
    return res.status(500).json({ error: "Unable to record the deletion request." });
  }
};
