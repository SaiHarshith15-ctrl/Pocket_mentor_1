/**
 * routes/termRoutes.js
 * Mounts: /api/terms
 * PURPOSE: backs the clickable SmartTerm drawer on the frontend.
 */
const express = require("express");
const { explainTerm } = require("../controllers/termController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/explain", protect, explainTerm);

module.exports = router;
