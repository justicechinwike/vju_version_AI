// Load multer for multipart screenshot uploads.
const multer = require("multer");
// Load the screen-session model.
const ScreenSession = require("../../models/ScreenSession");

// Keep uploads in memory until validation is complete.
const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
}).single("screenshot");

// Validate and receive an uploaded screenshot.
exports.upload = (req, res) => {
  uploadMiddleware(req, res, (error) => {
    if (error) return res.status(400).json({ error: "Screenshot upload is invalid or too large." });
    if (!req.file) return res.status(400).json({ error: "A screenshot file is required." });
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(415).json({ error: "Only PNG, JPEG, and WebP screenshots are supported." });
    }
    return res.json({
      message: "Screenshot validated and ready for authorized analysis.",
      filename: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
  });
};

// Create a new authorized screen-assistance session.
exports.createSession = async (req, res) => {
  try {
    const source = req.body.captureSource || "upload";
    const sessionRecord = await ScreenSession.create(req.session.user.id, source);
    return res.status(201).json({ message: "Screen-assistance session created.", session: sessionRecord });
  } catch (error) {
    console.error("Screen session creation failed:", error.message);
    return res.status(500).json({ error: "Unable to create a screen-assistance session." });
  }
};

// Stop an active screen-assistance session.
exports.stopSession = async (req, res) => {
  try {
    const record = await ScreenSession.stopByUser(req.params.id, req.session.user.id);
    if (!record) return res.status(404).json({ error: "Screen-assistance session was not found." });
    return res.json({ message: "Screen-assistance session stopped.", session: record });
  } catch (error) {
    console.error("Screen session stop failed:", error.message);
    return res.status(500).json({ error: "Unable to stop the screen-assistance session." });
  }
};
