/**
 * routes/flashcardRoutes.js
 * Mounts: /api/flashcards
 */
const express = require("express");
const { listFlashcards, reviewFlashcard } = require("../controllers/flashcardController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, listFlashcards);
router.post("/:id/review", protect, reviewFlashcard);

module.exports = router;
