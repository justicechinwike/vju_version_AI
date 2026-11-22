// Load the PostgreSQL pool.
const db = require("../../database/connect");

// List conversations belonging to the authenticated user.
exports.list = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id,title,created_at,updated_at FROM conversations WHERE user_id=$1 ORDER BY updated_at DESC",
      [req.session.user.id]
    );
    return res.json({ conversations: result.rows });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load conversations." });
  }
};

// Create a new conversation.
exports.create = async (req, res) => {
  try {
    const title = String(req.body.title || "New conversation").trim().slice(0, 180);
    const result = await db.query(
      "INSERT INTO conversations (user_id,title) VALUES ($1,$2) RETURNING *",
      [req.session.user.id, title]
    );
    return res.status(201).json({ conversation: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Unable to create a conversation." });
  }
};

// Retrieve a conversation owned by the user.
exports.get = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM conversations WHERE id=$1 AND user_id=$2 LIMIT 1",
      [req.params.id, req.session.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Conversation was not found." });
    return res.json({ conversation: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Unable to retrieve the conversation." });
  }
};

// Add a user message and educational assistant response.
exports.message = async (req, res) => {
  try {
    const text = String(req.body.message || "").trim();
    if (!text) return res.status(400).json({ error: "A message is required." });
    const existing = await db.query(
      "SELECT * FROM conversations WHERE id=$1 AND user_id=$2 LIMIT 1",
      [req.params.id, req.session.user.id]
    );
    if (!existing.rows[0]) return res.status(404).json({ error: "Conversation was not found." });

    const messages = Array.isArray(existing.rows[0].messages) ? existing.rows[0].messages : [];
    const prohibited = /\b(buy|sell|enter|exit)\b.*\b(now|immediately|position)\b/i.test(text);
    const answer = prohibited
      ? "I can explain the relevant market concepts and risks, but I cannot provide a personalized live buy or sell instruction."
      : "This is an educational response. Please verify the chart values and use the recognition limitations as part of your interpretation.";
    messages.push({ role: "user", content: text, timestamp: new Date().toISOString() });
    messages.push({ role: "assistant", content: answer, timestamp: new Date().toISOString() });

    const result = await db.query(
      "UPDATE conversations SET messages=$3, updated_at=NOW() WHERE id=$1 AND user_id=$2 RETURNING *",
      [req.params.id, req.session.user.id, JSON.stringify(messages)]
    );
    return res.json({ message: answer, conversation: result.rows[0] });
  } catch (error) {
    console.error("Chat processing failed:", error.message);
    return res.status(500).json({ error: "Unable to process the chat message." });
  }
};

// Delete a conversation owned by the user.
exports.remove = async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM conversations WHERE id=$1 AND user_id=$2 RETURNING id",
      [req.params.id, req.session.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Conversation was not found." });
    return res.json({ message: "Conversation deleted." });
  } catch (error) {
    return res.status(500).json({ error: "Unable to delete the conversation." });
  }
};
