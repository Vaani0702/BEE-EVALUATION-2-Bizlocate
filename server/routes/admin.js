const express = require("express");
const c = require("../controllers/adminController");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

// Every admin route needs: a valid token AND the "admin" role.
router.use(protect, allowRoles("admin"));

router.get("/properties", c.listForVerification);
router.patch("/properties/:id/verify", c.verifyProperty);
router.get("/stats", c.getStats);

module.exports = router;
