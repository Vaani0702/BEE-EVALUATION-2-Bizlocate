const express = require("express");
const { getMine, saveMine } = require("../controllers/requirementController");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/", getMine);
router.put("/", saveMine);

module.exports = router;
