const express = require("express");
const { createEnquiry, myEnquiries, updateStatus } = require("../controllers/enquiryController");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.post("/", createEnquiry);
router.get("/", myEnquiries);
router.patch("/:id/status", updateStatus);

module.exports = router;
