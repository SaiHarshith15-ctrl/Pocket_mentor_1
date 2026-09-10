/**
 * models/User.js
 *
 * PURPOSE:
 * Represents a student account. Holds auth credentials (hashed password),
 * onboarding info (department/year/subjects) and lightweight profile stats
 * that are cheap to read on every dashboard load (streak, overall mastery).
 *
 * CONNECTS TO:
 * - controllers/authController.js (register/login/me)
 * - controllers/userController.js (onboarding)
 * - controllers/dashboardController.js, profileController.js (reads stats)
 *
 * USED BY:
 * - middleware/auth.js attaches the decoded user to req.user after
 *   verifying the JWT, then re-fetches the full doc where needed.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },

    // ---- Onboarding ----
    department: {
      type: String,
      enum: ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", ""],
      default: "",
    },
    year: { type: Number, min: 1, max: 4, default: null },
    subjects: [{ type: String, trim: true }],
    onboardingComplete: { type: Boolean, default: false },

    // ---- Profile / gamification snapshot ----
    // These are denormalized counters updated by services (masteryService,
    // StudyActivity hooks) so the dashboard/profile can render instantly
    // without aggregating the whole history on every request.
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    stats: {
      questionsAnswered: { type: Number, default: 0 },
      flashcardsReviewed: { type: Number, default: 0 },
      topicsMastered: { type: Number, default: 0 },
      topicsRescued: { type: Number, default: 0 },
    },
    achievements: [{ type: String }], // achievement codes, e.g. "FIRST_QUIZ"
  },
  { timestamps: true }
);

// Hash password before saving, only if it changed
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Never leak the hash even if someone forgets .select("-passwordHash")
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
