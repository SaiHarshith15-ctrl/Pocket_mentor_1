/**
 * server.js
 *
 * PURPOSE:
 * Application entry point. Loads env vars, connects to MongoDB, wires up
 * middleware + every route module, and starts the HTTP server.
 *
 * CONNECTS TO:
 * - config/db.js
 * - routes/*.js
 * - middleware/errorHandler.js
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const quizRoutes = require("./routes/quizRoutes");
const rescueRoutes = require("./routes/rescueRoutes");
const progressRoutes = require("./routes/progressRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const profileRoutes = require("./routes/profileRoutes");
const termRoutes = require("./routes/termRoutes");

const app = express();

// ---- Core middleware ----
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---- Health check ----
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Pocket Mentor API is running",
    mockAiMode: String(process.env.USE_MOCK_AI).toLowerCase() === "true",
  });
});

// ---- Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/rescue", rescueRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/terms", termRoutes);

// ---- 404 + error handling (must be registered last) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Pocket Mentor API listening on port ${PORT}`);
    console.log(`[server] Mock AI mode: ${String(process.env.USE_MOCK_AI).toLowerCase() === "true"}`);
  });
}

start();

module.exports = app;
