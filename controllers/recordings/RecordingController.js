// Load the recording model.
const Recording = require("../../models/Recording");

// Create a recording session.
exports.create = async (req, res) => {
  try {
    const recording = await Recording.create({
      userId: req.session.user.id,
      name: req.body.name,
      mode: req.body.mode || "full-screen",
      resolution: req.body.resolution,
      frameRate: req.body.frameRate,
      audioConfig: req.body.audioConfig || { enabled: false }
    });
    return res.status(201).json({ recording });
  } catch (error) {
    return res.status(500).json({ error: "Unable to start the recording session." });
  }
};

// List user recordings.
exports.list = async (req, res) => {
  try {
    return res.json({ recordings: await Recording.listByUser(req.session.user.id) });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load recordings." });
  }
};

// Stop a recording.
exports.stop = async (req, res) => {
  try {
    const recording = await Recording.stopByUser(req.params.id, req.session.user.id);
    if (!recording) return res.status(404).json({ error: "Recording was not found." });
    return res.json({ recording });
  } catch (error) {
    return res.status(500).json({ error: "Unable to finalize the recording." });
  }
};

// Rename a recording.
exports.rename = async (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: "A recording name is required." });
    const recording = await Recording.renameByUser(req.params.id, req.session.user.id, req.body.name);
    if (!recording) return res.status(404).json({ error: "Recording was not found." });
    return res.json({ recording });
  } catch (error) {
    return res.status(500).json({ error: "Unable to rename the recording." });
  }
};

// Delete a recording.
exports.remove = async (req, res) => {
  try {
    const recording = await Recording.removeByUser(req.params.id, req.session.user.id);
    if (!recording) return res.status(404).json({ error: "Recording was not found." });
    return res.json({ message: "Recording deleted." });
  } catch (error) {
    return res.status(500).json({ error: "Unable to delete the recording." });
  }
};
