// Load password hashing utilities.
const bcrypt = require("bcryptjs");
// Load the user model.
const User = require("../../models/User");

// Return the login page view.
exports.loginPage = (req, res) => {
  res.sendFile(require("path").join(__dirname, "..", "..", "views", "login.html"));
};

// Return the registration page view.
exports.registerPage = (req, res) => {
  res.sendFile(require("path").join(__dirname, "..", "..", "views", "register.html"));
};

// Register a new user.
exports.register = async (req, res) => {
  try {
    // Validate required registration fields.
    const { fullName, email, password, confirmPassword, country, terms } = req.body;
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All required registration fields must be provided." });
    }
    // Reject mismatched passwords.
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }
    // Enforce minimum password quality.
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must contain at least 8 characters." });
    }
    // Require terms acceptance.
    if (!terms) {
      return res.status(400).json({ error: "Terms and privacy acceptance is required." });
    }
    // Prevent duplicate email registrations.
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "An account already exists with this email address." });
    }
    // Hash the password before database storage.
    const passwordHash = await bcrypt.hash(password, 12);
    // Create the user record.
    const user = await User.create({ fullName, email, passwordHash, country });
    // Return the created account summary.
    return res.status(201).json({
      message: "Registration completed. Please verify your email address.",
      user: { id: user.id, fullName: user.full_name, email: user.email }
    });
  } catch (error) {
    console.error("Registration failed:", error.message);
    return res.status(500).json({ error: "Registration is temporarily unavailable." });
  }
};

// Authenticate an existing account.
exports.login = async (req, res) => {
  try {
    // Read login fields.
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    // Find the account by email.
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    // Compare the supplied password with the secure hash.
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    // Prevent inactive users from creating sessions.
    if (user.status !== "active") {
      return res.status(403).json({ error: "This account is not currently active." });
    }
    // Store the minimal safe account identity in the session.
    req.session.user = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    };
    // Return successful login data.
    return res.json({ message: "Login successful.", user: req.session.user });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({ error: "Authentication is temporarily unavailable." });
  }
};

// Destroy the current browser session.
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("vju.sid");
    res.json({ message: "Logged out successfully." });
  });
};
