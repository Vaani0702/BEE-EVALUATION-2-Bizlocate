const express = require("express");
const c = require("../controllers/propertyController");
const { protect, optionalAuth, allowRoles } = require("../middleware/auth");
const { propertyUpload } = require("../middleware/upload");

const router = express.Router();

router.get("/", c.listProperties);                       // public
router.get("/mine", protect, c.myProperties);            // must be above "/:id"
router.get("/:id", optionalAuth, c.getProperty);         // public, but knows who is asking

// Middleware chain, runs left to right: check login -> check role -> Multer saves files -> controller
router.post("/", protect, allowRoles("owner"), propertyUpload, c.createProperty);

router.delete("/:id", protect, c.deleteProperty);
router.get("/:id/document", protect, c.getDocument);     // private PDF
router.get("/:id/payouts", protect, c.getPayouts);

module.exports = router;
