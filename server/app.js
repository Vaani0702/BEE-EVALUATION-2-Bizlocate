// Builds the Express app (kept separate from server.js so it can be tested).
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express(); // create the app (sir's notes: let app = express())

// --- middleware (runs on every request, in this order) ---
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true })); // let the React app call us AND send cookies
app.use(express.json());                                                       // read JSON bodies into req.body
app.use(cookieParser());                                                        // read cookies into req.cookies

// Property photos are public, so we serve ONLY the photos folder as static files.
// The "docs" folder is deliberately NOT served - PDFs go through a protected route.
app.use("/uploads/photos", express.static(path.join(__dirname, "uploads", "photos")));

// --- routes ---
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/properties", require("./routes/properties"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/enquiries", require("./routes/enquiries"));
app.use("/api/requirement", require("./routes/requirement"));
app.use("/api/shares", require("./routes/shares"));
app.use("/api/analytics", require("./routes/analytics"));

// --- last: unknown routes and errors ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
