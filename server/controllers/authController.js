const jwt = require("jsonwebtoken");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

// JWT = header . payload . signature
// jwt.sign builds the 3 parts: payload = {id}, signature = made with our secret code.
// Only the server knows JWT_SECRET, so nobody can fake a token.
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// COOKIE: the server puts the JWT in a cookie. The browser then sends it back
// automatically on every request, so React never has to touch the token.
// httpOnly = JavaScript cannot read it (safer against XSS).
const COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds (same as the JWT)
};
function setAuthCookie(res, userId) {
  res.cookie(COOKIE_NAME, signToken(userId), COOKIE_OPTIONS);
}

// What we send back to the browser (never the password).
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}

// POST /api/auth/signup
const signup = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  // Nobody can sign up as admin from the website (admin is created by seed.js).
  const safeRole = role === "owner" ? "owner" : "business";

  const user = await User.create({ name, email, password, role: safeRole });
  setAuthCookie(res, user._id);
  res.status(201).json({ user: publicUser(user) });
});

// POST /api/auth/login
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter email and password" });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  // Same message for "no such user" and "wrong password" so attackers learn nothing.
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  setAuthCookie(res, user._id);
  res.json({ user: publicUser(user) });
});

// GET /api/auth/me  (protected) - who is logged in right now?
function getMe(req, res) {
  res.json({ user: publicUser(req.user) });
}

// POST /api/auth/logout - delete the cookie
function logout(req, res) {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: "Logged out" });
}

module.exports = { signup, login, getMe, logout };
