/**
 * seed/seed.js
 *
 * PURPOSE:
 * Populates MongoDB with a demo account + sample learning data so the
 * dashboard, flashcards, quiz, profile, and Rescue Mode can all be
 * clicked through immediately, without needing to upload a real PDF or
 * spend any Gemini quota first.
 *
 * CONNECTS TO:
 * - models/User.js, Note.js, Topic.js, Flashcard.js, Quiz.js, StudyActivity.js
 * - services/mockAiService.js (reuses the exact same sample AI shapes so
 *   seeded data looks identical to what a real upload+analyze would produce)
 *
 * RUN WITH:
 *   npm run seed   (from /server, or `npm run seed` from the repo root)
 *
 * DEMO LOGIN (after seeding):
 *   email:    demo@pocketmentor.dev
 *   password: password123
 *
 * NOTE:
 * This script is destructive for the demo user only — it removes any
 * existing demo@pocketmentor.dev account and its data before recreating
 * it, so it's safe to re-run.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Note = require("../models/Note");
const Topic = require("../models/Topic");
const Flashcard = require("../models/Flashcard");
const Quiz = require("../models/Quiz");
const StudyActivity = require("../models/StudyActivity");
const { mockAnalyzeNotes } = require("../services/mockAiService");

const DEMO_EMAIL = "demo@pocketmentor.dev";
const DEMO_PASSWORD = "password123";
const SUBJECT = "DBMS";

const SAMPLE_NOTE_TEXT = `
Unit 3 - Normalization, Transactions, and Indexing

Normalization is the process of organizing tables to reduce redundancy.
1NF requires atomic column values. 2NF removes partial dependencies on a
composite key. 3NF removes transitive dependencies. BCNF is a stricter
version of 3NF.

A transaction is a group of operations executed as a single unit,
guaranteed by ACID: Atomicity, Consistency, Isolation, Durability.
Concurrent transactions can deadlock if they wait on each other's locks.

An index speeds up read queries at the cost of slower writes and extra
storage. SQL's HAVING clause filters grouped rows after aggregation,
while WHERE filters rows before grouping.
`.trim();

async function clearExistingDemoUser() {
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (!existing) return;

  const userId = existing._id;
  await Promise.all([
    Note.deleteMany({ user: userId }),
    Topic.deleteMany({ user: userId }),
    Flashcard.deleteMany({ user: userId }),
    Quiz.deleteMany({ user: userId }),
    StudyActivity.deleteMany({ user: userId }),
    User.deleteOne({ _id: userId }),
  ]);
  console.log("[seed] Removed existing demo user and their data");
}

async function seed() {
  await connectDB();
  await clearExistingDemoUser();

  // ---- User ----
  const user = await User.create({
    name: "Sai Demo",
    email: DEMO_EMAIL,
    passwordHash: DEMO_PASSWORD, // hashed by the User pre-save hook
    department: "CSE",
    year: 2,
    subjects: ["DSA", "DBMS", "Operating Systems", "Computer Networks"],
    onboardingComplete: true,
    currentStreak: 4,
    longestStreak: 7,
    lastActiveDate: new Date(),
    stats: {
      questionsAnswered: 12,
      flashcardsReviewed: 9,
      topicsMastered: 1,
      topicsRescued: 1,
    },
  });
  console.log(`[seed] Created demo user: ${user.email}`);

  // ---- Note (already "analyzed", using the same shape mockAiService produces) ----
  const analysis = mockAnalyzeNotes(SUBJECT);

  const note = await Note.create({
    user: user._id,
    subject: SUBJECT,
    title: "Unit 3 - Normalization, Transactions, Indexing",
    sourceType: "text",
    rawText: SAMPLE_NOTE_TEXT,
    summary: analysis.summary,
    keyTerms: analysis.keyTerms,
    status: "analyzed",
    analyzedAt: new Date(),
  });
  console.log("[seed] Created sample note (already analyzed)");

  // ---- Topics (mixed mastery levels so Dashboard/Rescue Mode have real data) ----
  const topicSeed = [
    { name: "Normalization", importance: "high", mastery: 38, correctCount: 1, incorrectCount: 3 },
    { name: "Transactions", importance: "high", mastery: 71, correctCount: 5, incorrectCount: 2 },
    { name: "Indexing", importance: "medium", mastery: 64, correctCount: 3, incorrectCount: 2 },
    { name: "SQL", importance: "medium", mastery: 92, correctCount: 8, incorrectCount: 1 },
  ];

  const topics = await Topic.insertMany(
    topicSeed.map((t) => ({
      user: user._id,
      subject: SUBJECT,
      note: note._id,
      name: t.name,
      importance: t.importance,
      mastery: t.mastery,
      mastered: t.mastery >= 80,
      masteredAt: t.mastery >= 80 ? new Date() : null,
      correctCount: t.correctCount,
      incorrectCount: t.incorrectCount,
      lastAttemptAt: new Date(),
      rescueAttempts: t.name === "Normalization" ? 1 : 0,
    }))
  );
  console.log(`[seed] Created ${topics.length} topics`);

  // ---- Flashcards ----
  const flashcards = await Flashcard.insertMany(
    analysis.flashcards.map((f) => ({
      user: user._id,
      subject: SUBJECT,
      topic: f.topic,
      note: note._id,
      question: f.question,
      answer: f.answer,
      difficulty: f.difficulty,
      origin: "initial",
      reviewCount: 1,
      correctCount: 1,
      lastRating: "good",
      lastReviewedAt: new Date(),
    }))
  );
  console.log(`[seed] Created ${flashcards.length} flashcards`);

  // ---- Quiz (initial, unattempted — ready for the demo flow) ----
  const quiz = await Quiz.create({
    user: user._id,
    subject: SUBJECT,
    note: note._id,
    type: "initial",
    questions: analysis.quiz,
  });
  console.log(`[seed] Created initial quiz (${quiz.questions.length} questions)`);

  // ---- Study activity for the last 14 days (drives the profile heatmap) ----
  const activityDocs = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - i);
    // Skip a couple of days so the heatmap isn't a solid block.
    if (i === 5 || i === 9) continue;
    activityDocs.push({ user: user._id, date, count: 1 + Math.floor(Math.random() * 4) });
  }
  await StudyActivity.insertMany(activityDocs);
  console.log(`[seed] Created ${activityDocs.length} days of study activity`);

  console.log("\n[seed] Done! Demo login:");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
