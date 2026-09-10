# Pocket Mentor (Backend)

**"Your notes. Your weak points. Your exam plan."**

Pocket Mentor is an AI-powered personal learning companion. It doesn't just
turn a PDF into a summary and a quiz — it identifies what a student doesn't
understand, generates targeted revision material for that exact weak topic,
re-tests them, and tracks mastery improvement until the topic is mastered
("Rescue Mode"). This delivery contains the **complete backend**; the
`client/` folder is left empty for you to build the frontend into.

## Problem

Students have notes but don't know what they don't understand.

## Solution

Pocket Mentor builds an adaptive learning loop: upload notes → AI analysis
→ flashcards + quiz → weak topics identified → targeted "Rescue Mode"
revision → re-quiz → mastery tracked → exam readiness score.

## Tech Stack

```text
Node.js
Express
MongoDB + Mongoose
JWT (jsonwebtoken) + bcryptjs
Google Gemini API (@google/generative-ai)
multer (PDF upload)
pdf-parse (PDF text extraction)
```

## Architecture

```text
Client (not included)
      │  REST / JSON, Authorization: Bearer <JWT>
      ▼
server/server.js  ──► routes/*.js ──► middleware/auth.js (protect)
                                   └► controllers/*.js
                                          │
                        ┌─────────────────┼─────────────────┐
                        ▼                 ▼                 ▼
                  models/*.js      services/*.js      utils/*.js
                  (Mongoose)      (business logic,    (asyncHandler,
                                   Gemini calls,        ApiError,
                                   scoring, mastery)     activity tracker)
                                          │
                                          ▼
                                 prompts/prompts.js
                                 (all Gemini prompt templates)
```

## Folder Structure

```text
server/
├── config/db.js              Mongo connection
├── controllers/               Route handlers (thin — call services)
├── middleware/                 auth (JWT), errorHandler, upload (multer)
├── models/                     Mongoose schemas
├── prompts/prompts.js          All Gemini prompt templates in one place
├── routes/                     Express routers, one per resource
├── services/
│   ├── geminiService.js        Every Gemini call goes through here
│   ├── mockAiService.js        Realistic fake AI responses (USE_MOCK_AI=true)
│   ├── masteryService.js       The mastery formula + weakest-topic queries
│   ├── quizService.js          Quiz scoring + adaptive ranking
│   └── pdfService.js           PDF text extraction
├── seed/seed.js                Demo user + sample data, no Gemini needed
├── uploads/                    Temp PDF storage (cleared after extraction)
└── server.js                   App entry point
```

## Environment Setup

Copy the example env file and fill in real values:

```bash
cp .env.example server/.env
```

| Variable | Meaning |
|---|---|
| `PORT` | Port the API listens on (default 5000) |
| `MONGODB_URI` | Local (`mongodb://127.0.0.1:27017/pocket-mentor`) or Atlas connection string |
| `JWT_SECRET` | Long random string used to sign auth tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `GEMINI_API_KEY` | From https://aistudio.google.com/app/apikey |
| `GEMINI_MODEL` | Defaults to `gemini-1.5-flash` |
| `USE_MOCK_AI` | `true` = no API key needed, realistic fake AI responses; `false` = real Gemini calls |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `MASTERY_THRESHOLD` | 0–100 score at which a topic counts as "mastered" |

## Installation

```bash
npm run install:server
# equivalent to: cd server && npm install
```

## MongoDB Setup

- **Local**: install MongoDB Community Edition, run `mongod`, use the default
  `MONGODB_URI` in `.env.example`.
- **Atlas**: create a free cluster at mongodb.com/atlas, get the connection
  string, and paste it into `MONGODB_URI` (URL-encode any special characters
  in your password).

## Gemini Setup

1. Get a key at https://aistudio.google.com/app/apikey.
2. Put it in `server/.env` as `GEMINI_API_KEY`.
3. Set `USE_MOCK_AI=false` to use it. Leave it `true` to develop without
   spending quota — `services/mockAiService.js` returns realistic sample
   data shaped exactly like the real Gemini output.

## Running the Project

```bash
# terminal 1 — seed a demo account with sample data (optional but recommended)
npm run seed

# terminal 2 — start the API (with nodemon, auto-restart on save)
npm run dev:server
```

The API is then live at `http://localhost:5000/api`. Health check:
`GET /api/health`.

**Demo login (after seeding):** `demo@pocketmentor.dev` / `password123`

## API Overview

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                     (protected)

PUT    /api/users/onboarding            (protected)

POST   /api/notes/upload                (protected, multipart 'file' OR JSON 'text')
GET    /api/notes                       (protected)
GET    /api/notes/:id                   (protected)
POST   /api/notes/:id/analyze           (protected — the one Gemini call per note)

GET    /api/flashcards                  (protected, ?subject=&topic=)
POST   /api/flashcards/:id/review       (protected, { rating })

POST   /api/quizzes/generate            (protected, { noteId })
GET    /api/quizzes/:id                 (protected)
POST   /api/quizzes/:id/submit          (protected, { answers })

POST   /api/rescue/start                (protected, { topicId })
POST   /api/rescue/:topicId/generate    (protected — targeted Gemini call)
POST   /api/rescue/:topicId/submit      (protected, { quizId, answers })

GET    /api/progress                    (protected, ?subject=)
GET    /api/progress/topics             (protected, ?subject=)

GET    /api/dashboard                   (protected)

POST   /api/mentor/chat                 (protected, { message, history })

GET    /api/profile                     (protected)
GET    /api/profile/activity            (protected, ?days=84)
GET    /api/profile/achievements        (protected)

POST   /api/terms/explain               (protected, { term, subject, noteId? })
```

All responses follow `{ success: boolean, data?: ..., message?: ... }`.
Protected routes require `Authorization: Bearer <token>` from
register/login.

## Database Models

```text
User            auth, onboarding (dept/year/subjects), streak + stats snapshot
Note            uploaded PDF/text + its one-time AI analysis (summary, keyTerms)
Topic           per (user, subject, topic name) — the mastery score lives here
Flashcard       question/answer + review tracking, tagged initial|rescue
Quiz            embedded questions, tagged initial|rescue|adaptive
QuizAttempt     one submission's answers + topic-wise breakdown
StudyActivity   one row per (user, day) — powers the heatmap + streak
```

## AI Flow (Gemini Free-Tier Strategy)

```text
PDF/text uploaded
      ↓
services/pdfService.js extracts text
      ↓
POST /notes/:id/analyze → ONE geminiService.analyzeNotes() call
      ↓
Returns: summary, importantTopics, flashcards, quiz, keyTerms
      ↓
Persisted to MongoDB (Note, Topic, Flashcard, Quiz)
      ↓
Every later screen (Flashcards, Quiz, Dashboard, Profile) reads from
MongoDB — NOT from Gemini again.
      ↓
Gemini is called again ONLY for:
  - Rescue Mode targeted revision (services/geminiService.generateTargetedRevision)
  - AI Mentor chat replies (services/geminiService.chat)
  - On-demand SmartTerm explanations not already in Note.keyTerms
```

All Gemini JSON responses are validated (`validateAnalysis` /
`validateRevision` in `geminiService.js`) before being saved — a quiz
question whose `correctAnswer` isn't one of its own `options` is rejected
rather than silently stored.

## Hackathon Demo Flow (2–3 minutes)

```text
Login (demo@pocketmentor.dev / password123, after `npm run seed`)
 → Dashboard shows Normalization at 38% as the Priority Topic
 → Take the seeded quiz, answer a Normalization question wrong
 → Topic breakdown flags Normalization 🔴
 → Click "Rescue Mode" → targeted explanation + 3 new flashcards + re-quiz
 → Answer correctly → "38% → 71%" improvement shown
 → Repeat until "🏆 TOPIC MASTERED"
 → Profile page shows the activity heatmap, streak, and stats update live
```

## Future Improvements

- Real spaced repetition scheduling for flashcards (see `Flashcard.js` TODO)
- Weighted adaptive quiz sampling instead of "weakest first" (see
  `quizService.js` TODO)
- Server-side persisted AI Mentor conversation history (see
  `mentorController.js` TODO)
- OCR fallback for scanned/image-only PDFs (see `pdfService.js` TODO)
- `evaluateAnswer()` / `generateStudyRecommendation()` as dedicated
  structured Gemini calls (see `geminiService.js` TODO)
- DB-backed configurable achievements (see `profileController.js` TODO)
- Voice mentor, exam schedule integration, collaborative study, mobile app

## Known TODOs

Every intentionally-incomplete piece is marked inline with a
`// TODO(PHASE-N):` comment explaining what to build, where the data comes
from, and a suggested approach. Search the codebase for `TODO(` to find
all of them — they currently live in:

- `models/Flashcard.js` — spaced repetition fields
- `services/quizService.js` — weighted adaptive sampling
- `services/geminiService.js` — `evaluateAnswer`, `generateStudyRecommendation`
- `controllers/mentorController.js` — persisted conversation history
- `services/pdfService.js` — OCR for scanned PDFs
- `controllers/profileController.js` — DB-backed achievements

## What's NOT included in this ZIP

- The `client/` React frontend — the folder exists but is intentionally
  empty (per request). All frontend code from your original build (App.jsx,
  pages, components, context/AuthContext, services/api.js, etc.) still
  applies unchanged against this backend's API — nothing about the routes
  or response shapes changed.
