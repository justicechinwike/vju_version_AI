// Load the PostgreSQL pool.
const db = require("../../database/connect");

// Return platform-wide operational statistics.
exports.statistics = async (req, res) => {
  try {
    const [users, active, reports, sessions, payments] = await Promise.all([
      db.query("SELECT COUNT(*)::int AS count FROM users"),
      db.query("SELECT COUNT(*)::int AS count FROM users WHERE status='active'"),
      db.query("SELECT COUNT(*)::int AS count FROM analysis_reports"),
      db.query("SELECT COUNT(*)::int AS count FROM screen_sessions"),
      db.query("SELECT COUNT(*)::int AS count FROM payments")
    ]);
    return res.json({
      users: users.rows[0].count,
      activeUsers: active.rows[0].count,
      reports: reports.rows[0].count,
      screenSessions: sessions.rows[0].count,
      payments: payments.rows[0].count
    });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load administrative statistics." });
  }
};

// Search and list registered users for authorized administrators.
exports.users = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const result = search
      ? await db.query(
          `SELECT id,full_name,email,country,role,status,email_verified,created_at
           FROM users WHERE full_name ILIKE $1 OR email ILIKE $1 ORDER BY created_at DESC`,
          [`%${search}%`]
        )
      : await db.query(
          `SELECT id,full_name,email,country,role,status,email_verified,created_at
           FROM users ORDER BY created_at DESC LIMIT 200`
        );
    return res.json({ users: result.rows });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load registered users." });
  }
};

// Suspend or restore an account.
exports.updateUserStatus = async (req, res) => {
  try {
    if (!["active", "suspended"].includes(req.body.status)) {
      return res.status(400).json({ error: "Status must be active or suspended." });
    }
    const result = await db.query(
      "UPDATE users SET status=$2,updated_at=NOW() WHERE id=$1 RETURNING id,full_name,email,status",
      [req.params.id, req.body.status]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "User was not found." });
    await db.query(
      "INSERT INTO audit_logs (actor_user_id,action,entity,entity_id,details) VALUES ($1,'update_user_status','user',$2,$3)",
      [req.session.user.id, String(req.params.id), JSON.stringify({ status: req.body.status })]
    );
    return res.json({ user: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Unable to update user status." });
  }
};

// Retrieve recent administrative audit records.
exports.audit = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200");
    return res.json({ audit: result.rows });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load audit records." });
  }
};

// Update a protected application configuration key.
exports.updateConfig = async (req, res) => {
  try {
    if (!req.body.value) return res.status(400).json({ error: "Configuration value is required." });
    const result = await db.query(
      `INSERT INTO app_config (key,value,updated_at) VALUES ($1,$2,NOW())
       ON CONFLICT (key) DO UPDATE SET value=$2,updated_at=NOW() RETURNING *`,
      [req.params.key, JSON.stringify(req.body.value)]
    );
    await db.query(
      "INSERT INTO audit_logs (actor_user_id,action,entity,entity_id,details) VALUES ($1,'update_app_config','config',$2,$3)",
      [req.session.user.id, req.params.key, JSON.stringify({ value: req.body.value })]
    );
    return res.json({ configuration: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Unable to update application configuration." });
  }
};
