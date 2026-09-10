/**
 * components/LoadingSpinner.jsx
 *
 * PURPOSE:
 * Reusable loading indicator. Every data-fetching page (Dashboard,
 * Notes, Flashcards, Quiz, RescueMode, Profile) already renders
 * `<LoadingSpinner full />` while its initial api.get() call is
 * pending, and ProtectedRoute.jsx renders it while the auth session is
 * being restored.
 *
 * CONNECTS TO:
 * - pages/Dashboard.jsx, Notes.jsx, Flashcards.jsx, Quiz.jsx,
 *   RescueMode.jsx, Profile.jsx (all import it as
 *   `import LoadingSpinner from "../components/LoadingSpinner"`)
 * - components/ProtectedRoute.jsx
 *
 * NOT YET IMPLEMENTED — build this file yourself, or hand the prompt
 * below to an AI assistant:
 *
 * PROMPT TO GENERATE THIS FILE:
 * "Create a LoadingSpinner component that accepts a single `full`
 * boolean prop.
 *   - When full is true, render a spinner centered in a full-viewport
 *     container (min-h-screen flex items-center justify-center).
 *   - When full is false/omitted, render a small inline spinner
 *     (e.g. w-5 h-5) suitable for sitting next to text or inside a
 *     button.
 * Build the spinner itself with a plain Tailwind
 * `animate-spin rounded-full border-2 border-slate-700 border-t-brand`
 * div — no external spinner library needed."
 */




export default function LoadingSpinner({ full = false }) {
  const spinner = (
    <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-brand animate-spin" />
  );

  if (full) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">{spinner}</div>
    );
  }

  return spinner;
}