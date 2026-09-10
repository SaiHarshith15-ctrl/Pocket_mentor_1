/**
 * controllers/userController.js
 *
 * PURPOSE:
 * Handles onboarding: department/year/subject selection, saved to the
 * logged-in user. This data later drives dashboard recommendations and
 * scopes which subjects Notes/Flashcards/Quiz pages show.
 *
 * CONNECTS TO:
 * - models/User.js
 * - routes/userRoutes.js (PUT /api/users/onboarding, protected)
 */

const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const VALID_DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];

// PUT /api/users/onboarding
const completeOnboarding = asyncHandler(async (req, res) => {
  const { department, year, subjects } = req.body;

  if (!VALID_DEPARTMENTS.includes(department)) {
    throw new ApiError(400, `department must be one of: ${VALID_DEPARTMENTS.join(", ")}`);
  }
  if (!Number.isInteger(year) || year < 1 || year > 4) {
    throw new ApiError(400, "year must be an integer between 1 and 4");
  }
  if (!Array.isArray(subjects) || subjects.length === 0) {
    throw new ApiError(400, "subjects must be a non-empty array");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      department,
      year,
      subjects: subjects.map((s) => String(s).trim()).filter(Boolean),
      onboardingComplete: true,
    },
    { new: true, runValidators: true }
  );

  res.json({ success: true, data: { user } });
});

module.exports = { completeOnboarding };
