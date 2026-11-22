// Load the Express router.
const express = require("express");
// Load screen-assistant controller.
const screenController = require("../controllers/screen/ScreenController");
// Load chart and AI analysis controller.
const analysisController = require("../controllers/analysis/AnalysisController");
// Load conversational AI controller.
const chatController = require("../controllers/chat/ChatController");
// Load report controller.
const reportController = require("../controllers/reports/ReportController");
// Load recording controller.
const recordingController = require("../controllers/recordings/RecordingController");
// Load learning controller.
const learningController = require("../controllers/learning/LearningController");
// Load subscription controller.
const subscriptionController = require("../controllers/subscriptions/SubscriptionController");
// Load notification controller.
const notificationController = require("../controllers/notifications/NotificationController");
// Load voice controller.
const voiceController = require("../controllers/voice/VoiceController");
// Load administrative controller.
const adminController = require("../controllers/admin/AdminController");
// Load profile controller.
const profileController = require("../controllers/profile/ProfileController");

// Create an API router.
const router = express.Router();

// Require authentication for protected API operations.
function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Authentication required." });
  return next();
}

// Require administrator role for administrative operations.
function requireAdmin(req, res, next) {
  if (!req.session.user || !["administrator", "super_administrator"].includes(req.session.user.role)) {
    return res.status(403).json({ error: "Administrative permission required." });
  }
  return next();
}

// Screen and chart analysis APIs.
router.post("/screen/upload", requireAuth, screenController.upload);
router.post("/screen/sessions", requireAuth, screenController.createSession);
router.post("/screen/sessions/:id/stop", requireAuth, screenController.stopSession);
router.post("/analysis/run", requireAuth, analysisController.run);
router.get("/platforms", analysisController.platforms);

// Chat APIs.
router.get("/chat/conversations", requireAuth, chatController.list);
router.post("/chat/conversations", requireAuth, chatController.create);
router.get("/chat/conversations/:id", requireAuth, chatController.get);
router.post("/chat/conversations/:id/messages", requireAuth, chatController.message);
router.delete("/chat/conversations/:id", requireAuth, chatController.remove);

// Report APIs.
router.get("/reports", requireAuth, reportController.list);
router.get("/reports/:id", requireAuth, reportController.get);
router.delete("/reports/:id", requireAuth, reportController.remove);
router.get("/reports/:id/export", requireAuth, reportController.exportText);

// Recording APIs.
router.post("/recordings", requireAuth, recordingController.create);
router.get("/recordings", requireAuth, recordingController.list);
router.patch("/recordings/:id", requireAuth, recordingController.rename);
router.post("/recordings/:id/stop", requireAuth, recordingController.stop);
router.delete("/recordings/:id", requireAuth, recordingController.remove);

// Learning APIs.
router.get("/learning", learningController.list);
router.get("/learning/:id", learningController.get);
router.post("/learning/:id/progress", requireAuth, learningController.progress);
router.post("/learning/:id/save", requireAuth, learningController.save);

// Subscription APIs.
router.get("/subscriptions/plans", subscriptionController.plans);
router.get("/subscriptions", requireAuth, subscriptionController.current);
router.post("/subscriptions/checkout", requireAuth, subscriptionController.checkout);

// Notification APIs.
router.get("/notifications", requireAuth, notificationController.list);
router.patch("/notifications/:id/read", requireAuth, notificationController.read);
router.delete("/notifications/:id", requireAuth, notificationController.remove);

// Voice APIs.
router.get("/voice/preferences", requireAuth, voiceController.get);
router.put("/voice/preferences", requireAuth, voiceController.update);

// Profile APIs.
router.get("/profile", requireAuth, profileController.get);
router.put("/profile", requireAuth, profileController.update);
router.post("/profile/delete-request", requireAuth, profileController.deleteRequest);

// Health endpoint.
router.get("/health", async (req, res) => {
  try {
    await require("../database/connect").query("SELECT 1");
    res.json({ status: "healthy", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: "degraded", database: "disconnected", timestamp: new Date().toISOString() });
  }
});

// Administrative APIs.
router.get("/admin/statistics", requireAdmin, adminController.statistics);
router.get("/admin/users", requireAdmin, adminController.users);
router.patch("/admin/users/:id/status", requireAdmin, adminController.updateUserStatus);
router.get("/admin/audit", requireAdmin, adminController.audit);
router.put("/admin/config/:key", requireAdmin, adminController.updateConfig);

// Export API routes.
module.exports = router;
