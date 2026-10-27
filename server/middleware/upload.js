// MULTER = reads "multipart/form-data" (forms that contain files) and saves the files on the server.
// express.json() cannot read files, so for the "List Property" form we put this middleware in front.
const multer = require("multer");
const path = require("path"); // built-in module for file paths
const fs = require("fs");     // built-in module for the file system

// 1. WHERE and WHAT NAME to save the file with
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // photos go to uploads/photos, the PDF goes to uploads/docs
    const folder = file.fieldname === "ownershipDoc" ? "docs" : "photos";
    const dir = path.join(__dirname, "..", "uploads", folder);
    fs.mkdirSync(dir, { recursive: true }); // create the folder if it is missing
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // unique name: time + random number + original extension (.jpg / .pdf)
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  }
});

// 2. WHICH files are allowed
function badFile(message) {
  const err = new Error(message);
  err.status = 400; // so errorHandler replies "400 Bad Request" instead of 500
  return err;
}

function fileFilter(req, file, cb) {
  if (file.fieldname === "photos") {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    return ok ? cb(null, true) : cb(badFile("Photos must be JPG, PNG or WEBP images"));
  }
  if (file.fieldname === "ownershipDoc") {
    const ok = file.mimetype === "application/pdf";
    return ok ? cb(null, true) : cb(badFile("Ownership document must be a PDF"));
  }
  cb(badFile("Unexpected file field: " + file.fieldname));
}

// 3. Put it together. Max 5 MB per file.
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// The form sends up to 6 photos (field "photos") and exactly 1 PDF (field "ownershipDoc").
const propertyUpload = upload.fields([
  { name: "photos", maxCount: 6 },
  { name: "ownershipDoc", maxCount: 1 }
]);

module.exports = { propertyUpload };
