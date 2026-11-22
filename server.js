// Load environment variables for the application process.
require("dotenv").config();
// Load the Express web framework.
const express = require("express");
// Load helmet for baseline HTTP security headers.
const helmet = require("helmet");
// Load session middleware for authenticated browser sessions.
const session = require("express-session");
// Load the PostgreSQL pool for startup verification.
const db = require("./database/connect");
// Load application routes.
const routes = require("./routes");

// Create the Express application instance.
const app = express();
// Read JSON request bodies.
app.use(express.json({ limit: "25mb" }));
// Read URL-encoded form request bodies.
app.use(express.urlencoded({ extended: true }));
// Apply baseline security headers.
app.use(helmet({ contentSecurityPolicy: false }));
// Serve the MVC static assets.
app.use(express.static("public"));
// Configure server-side sessions.
app.use(session({
  name: "vju.sid",
  secret: process.env.SESSION_SECRET || "development-session-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 }
}));

// Register application routes.
app.use(routes);

// Verify database connectivity before starting the HTTP server.
async function start() {
  try {
    await db.query("SELECT 1");
    console.log("PostgreSQL connection verified");
  } catch (error) {
    console.warn("PostgreSQL unavailable:", error.message);
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`VJU Vision AI listening on http://localhost:${port}`);
  });
}

// Start the application.
start();
