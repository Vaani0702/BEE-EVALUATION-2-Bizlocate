const express = require("express");
const { myAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/me", protect, myAnalytics);

module.exports = router;
