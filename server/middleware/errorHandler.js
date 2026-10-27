// Express treats a function with 4 parameters (err, req, res, next) as the ERROR handler.
// Every error from catchAsync / Multer ends up here and becomes a clean JSON reply.
const multer = require("multer");

function notFound(req, res) {
  res.status(404).json({ message: "Route not found: " + req.method + " " + req.originalUrl });
}

function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Each file must be 5 MB or smaller" : "Upload error: " + err.message;
    return res.status(400).json({ message });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid id" });           // bad ObjectId
  if (err.name === "ValidationError") return res.status(400).json({ message: err.message });      // Mongoose schema rule broken
  if (err.code === 11000) return res.status(409).json({ message: "That value already exists" });  // duplicate key

  console.error(err);
  // fileFilter errors (wrong file type) arrive here as plain Errors - show their message.
  res.status(err.status || 500).json({ message: err.message || "Server error" });
}

module.exports = { notFound, errorHandler };
