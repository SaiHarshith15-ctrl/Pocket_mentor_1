# Pocket Mentor — Client

This folder contains the React (Vite) frontend for Pocket Mentor.

## What's already here

All 10 pages and 2 shared components were already written and are
pasted in as-is, fully working against the backend API contract:

- `src/pages/`: Login, Register, Onboarding, Dashboard, Notes,
  Flashcards, Quiz, RescueMode, AIMentor, Profile
- `src/components/`: SmartTerm.jsx (SmartText), TermDrawer.jsx
- `src/App.jsx`: route table

## What's still a stub

The files below only contain a header comment (purpose, what they
connect to, and the exact prompt you can hand an AI assistant — or use
yourself — to implement them). Nothing in this list has real code yet:

| File | Why it's needed |
|---|---|
| `src/services/api.js` | shared axios instance every page imports |
| `src/context/AuthContext.jsx` | `useAuth()` / `AuthProvider` used by App.jsx, Login, Register, Onboarding |
| `src/components/ProtectedRoute.jsx` | route guard used by every private route in App.jsx |
| `src/components/Navbar.jsx` | top nav rendered by App.jsx's `<Layout>` |
| `src/components/LoadingSpinner.jsx` | `<LoadingSpinner full />` used by Dashboard/Notes/Flashcards/Quiz/RescueMode/Profile |
| `src/main.jsx` | Vite/React entry point |
| `src/index.css` | Tailwind directives + the `.card`/`.btn-primary`/etc classes every page uses |
| `index.html` | Vite HTML entry point |
| `vite.config.js` | Vite + React plugin config |
| `tailwind.config.js` | Tailwind content paths + the `brand`/`brand-light` color used everywhere |
| `postcss.config.js` | wires Tailwind + Autoprefixer into the build |

Open each file — the comment at the top tells you exactly what to
build and gives you a ready-to-use prompt.

## Setup once the stubs above are filled in

```bash
npm install
cp .env.example .env   # adjust VITE_API_URL if your backend isn't on :5000
npm run dev
```

The app expects the backend (see `../server`) running with
`CLIENT_URL=http://localhost:5173` in `server/.env` so CORS allows it.
