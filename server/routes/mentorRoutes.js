/**
 * routes/mentorRoutes.js
 * Mounts: /api/mentor
 */
const express = require("express");
const { chatWithMentor } = require("../controllers/mentorController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/chat", protect, chatWithMentor);

module.exports = router;
