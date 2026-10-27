const express = require("express");
const { signup, login, getMe, logout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe); // protect runs first

module.exports = router;
