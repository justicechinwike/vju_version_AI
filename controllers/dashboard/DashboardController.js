// Load the built-in path utility.
const path = require("path");
// Load the PostgreSQL pool.
const db = require("../../database/connect");

// Return the main dashboard view.
exports.dashboardPage = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "views", "dashboard.html"));
};

// Return dashboard data for the authenticated user.
exports.dashboardData = async (req, res) => {
  try {
    // Retrieve report and conversation totals.
    const [reports, conversations, subscription] = await Promise.all([
      db.query("SELECT COUNT(*)::int AS count FROM analysis_reports WHERE user_id = $1", [req.session.user.id]),
      db.query("SELECT COUNT(*)::int AS count FROM conversations WHERE user_id = $1", [req.session.user.id]),
      db.query(`SELECT p.name FROM subscriptions s JOIN subscription_plans p ON p.id=s.plan_id
                WHERE s.user_id=$1 AND s.status='active' ORDER BY s.id DESC LIMIT 1`, [req.session.user.id])
    ]);
    // Send dashboard summary.
    return res.json({
      user: req.session.user,
      reports: reports.rows[0].count,
      conversations: conversations.rows[0].count,
      subscription: subscription.rows[0]?.name || "Free",
      aiUsageRemaining: 20,
      recentActivity: []
    });
  } catch (error) {
    console.error("Dashboard data failed:", error.message);
    return res.status(500).json({ error: "Dashboard information is temporarily unavailable." });
  }
};
