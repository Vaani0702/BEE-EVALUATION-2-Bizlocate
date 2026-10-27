// Deletes files from the disk using Node's built-in "fs" module (fs.unlink = delete).
// Used when a listing is deleted, or when a form fails after Multer already saved the files.
const fs = require("fs");
const path = require("path");

const uploadsRoot = path.join(__dirname, "..", "uploads");

// paths looks like: ["/uploads/photos/123.jpg", "docs/456.pdf"]
function removeUploads(paths) {
  paths.forEach((p) => {
    if (!p || p.startsWith("http")) return; // seed data uses web URLs, nothing on disk
    const relative = p.replace(/^\/?uploads\//, ""); // "photos/123.jpg"
    const full = path.join(uploadsRoot, relative);
    fs.unlink(full, () => {}); // empty callback: ignore "file not found"
  });
}

// Used by the controller after Multer ran: delete everything that was just uploaded.
function removeMulterFiles(files) {
  const all = Object.values(files || {}).flat(); // {photos:[..], ownershipDoc:[..]} -> one array
  all.forEach((f) => fs.unlink(f.path, () => {}));
}

module.exports = { removeUploads, removeMulterFiles };
