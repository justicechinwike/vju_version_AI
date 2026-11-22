// Load the PostgreSQL pool.
const db = require("../../database/connect");

// Retrieve the user's voice preferences.
exports.get = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM voice_preferences WHERE user_id=$1", [req.session.user.id]);
    return res.json({ preferences: result.rows[0] || {
      voice_activation: true,
      voice_response: true,
      language: "en",
      playback_volume: 70
    } });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load voice preferences." });
  }
};

// Create or update voice preferences.
exports.update = async (req, res) => {
  try {
    const volume = Math.max(0, Math.min(100, Number(req.body.playbackVolume || 70)));
    const result = await db.query(
      `INSERT INTO voice_preferences
       (user_id,voice_activation,voice_response,language,voice_name,playback_volume)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (user_id)
       DO UPDATE SET voice_activation=$2, voice_response=$3, language=$4,
       voice_name=$5, playback_volume=$6
       RETURNING *`,
      [req.session.user.id, Boolean(req.body.voiceActivation),
       Boolean(req.body.voiceResponse), req.body.language || "en",
       req.body.voiceName || null, volume]
    );
    return res.json({ preferences: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: "Unable to update voice preferences." });
  }
};
