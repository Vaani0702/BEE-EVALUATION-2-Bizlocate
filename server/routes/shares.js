const express = require("express");
const { requestShare, getRequestsForProperty, decideRequest } = require("../controllers/shareController");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/property/:propertyId", getRequestsForProperty);
router.post("/:propertyId", requestShare);
router.patch("/:requestId", decideRequest);

module.exports = router;
