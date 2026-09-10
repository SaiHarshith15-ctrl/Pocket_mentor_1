/**
 * config/db.js
 *
 * PURPOSE:
 * Opens and manages the single Mongoose connection to MongoDB.
 *
 * CONNECTS TO:
 * - server.js (called once on startup)
 *
 * USED FOR:
 * - Every model in /models relies on this connection being established
 *   before any query runs.
 *
 * IMPORTANT:
 * MONGODB_URI comes from process.env (see .env.example).
 * If the connection fails, the process exits so the failure is loud
 * instead of the API silently returning empty data.
 */

const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("[db] MONGODB_URI is not set. Check your .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`[db] MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err.message);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
  });
}

module.exports = connectDB;
