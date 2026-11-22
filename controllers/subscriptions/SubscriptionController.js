// Load the PostgreSQL pool.
const db = require("../../database/connect");

// List active subscription plans.
exports.plans = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM subscription_plans WHERE active=TRUE ORDER BY price ASC");
    return res.json({ plans: result.rows });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load subscription plans." });
  }
};

// Retrieve the active subscription for the user.
exports.current = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*,p.name,p.description,p.features,p.usage_limits
       FROM subscriptions s JOIN subscription_plans p ON p.id=s.plan_id
       WHERE s.user_id=$1 AND s.status='active' ORDER BY s.id DESC LIMIT 1`,
      [req.session.user.id]
    );
    return res.json({ subscription: result.rows[0] || null });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load subscription information." });
  }
};

// Create a payment checkout record; provider activation requires server-side verification.
exports.checkout = async (req, res) => {
  try {
    const planId = Number(req.body.planId);
    if (!planId) return res.status(400).json({ error: "A valid subscription plan is required." });
    const plan = await db.query("SELECT * FROM subscription_plans WHERE id=$1 AND active=TRUE LIMIT 1", [planId]);
    if (!plan.rows[0]) return res.status(404).json({ error: "Subscription plan was not found." });
    return res.status(202).json({
      message: "Checkout initialized. Complete payment with an authorized provider.",
      plan: plan.rows[0],
      verificationRequired: true
    });
  } catch (error) {
    return res.status(500).json({ error: "Unable to initialize checkout." });
  }
};
