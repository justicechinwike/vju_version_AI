// Load the Express router.
const express = require("express");
// Load the built-in path utility.
const path = require("path");
// Load authentication controller.
const authController = require("../controllers/auth/AuthController");
// Load dashboard controller.
const dashboardController = require("../controllers/dashboard/DashboardController");
// Load API route factory.
const apiRoutes = require("./api");

// Create a router for pages and API groups.
const router = express.Router();

// Authentication middleware for protected pages.
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  return next();
}

// Render the public registration page.
router.get("/register", authController.registerPage);
// Render the public login page.
router.get("/login", authController.loginPage);
// Create a user account.
router.post("/api/auth/register", authController.register);
// Authenticate a user.
router.post("/api/auth/login", authController.login);
// End the authenticated session.
router.post("/api/auth/logout", authController.logout);

// Render the protected dashboard.
router.get("/", requireAuth, dashboardController.dashboardPage);
// Alias for explicit dashboard access.
router.get("/dashboard", requireAuth, dashboardController.dashboardPage);
// Return dashboard API data.
router.get("/api/dashboard", requireAuth, dashboardController.dashboardData);

// Mount all API controllers.
router.use("/api", apiRoutes);

// Render named standalone MVC views.
[
  "screen-assistant",
  "ai-chat",
  "chart-analysis",
  "learning",
  "reports",
  "recordings",
  "subscriptions",
  "notifications",
  "profile",
  "settings",
  "support",
  "admin"
].forEach((page) => {
  router.get(`/${page}`, requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", `${page}.html`));
  });
});

// Export the configured router.
module.exports = router;
