// Middleware = a function that runs BEFORE the route handler.
// AUTHENTICATION = "who are you?"  ->  protect (checks the JWT)
// AUTHORIZATION  = "are you allowed?" -> allowRoles (checks the role)
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Reads the JWT from the "token" cookie (cookie-parser puts cookies in req.cookies)
// and returns the user, or null.
async function getUserFromRequest(req) {
  const token = req.cookies && req.cookies.token;
  if (!token) return null;

  const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if fake or expired
  return User.findById(decoded.id);
}

// protect: only lets a request through if its cookie holds a valid JWT.
async function protect(req, res, next) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ message: "Please login first" });
    req.user = user; // available to the route handler
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token, please login again" });
  }
}

// optionalAuth: for public pages. If a valid token is sent we know WHO is looking
// (so the owner can see their own pending listing), otherwise the visitor is anonymous.
async function optionalAuth(req, res, next) {
  try {
    req.user = await getUserFromRequest(req);
  } catch (err) {
    req.user = null;
  }
  next();
}

// allowRoles("admin") -> only those roles may continue.
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Your role (" + req.user.role + ") is not allowed to do this" });
    }
    next();
  };
}

module.exports = { protect, optionalAuth, allowRoles };
