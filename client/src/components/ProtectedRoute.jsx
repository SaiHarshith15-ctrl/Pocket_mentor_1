/**
 * components/ProtectedRoute.jsx
 *
 * PURPOSE:
 * Route guard used by every private route in App.jsx (Dashboard, Notes,
 * Flashcards, Quiz, RescueMode, AIMentor, Profile, Onboarding). Keeps
 * logged-out users out, and pushes logged-in-but-not-onboarded users
 * into /onboarding before they can reach the rest of the app.
 *
 * CONNECTS TO:
 * - context/AuthContext.jsx (reads `user` and `loading` via useAuth())
 * - App.jsx (wraps every protected <Route element={...}>)
 *
 * NOT YET IMPLEMENTED — build this file yourself, or hand the prompt
 * below to an AI assistant:
 *
 * PROMPT TO GENERATE THIS FILE:
 * "Create a ProtectedRoute component that takes `children` as a prop.
 * Read { user, loading } from useAuth(). Behavior:
 *   - While loading is true, render <LoadingSpinner full />.
 *   - If loading is false and there is no user, render
 *     <Navigate to='/login' replace />.
 *   - If there is a user but user.onboardingComplete is false, and the
 *     current route (via useLocation from react-router-dom) is not
 *     already '/onboarding', render <Navigate to='/onboarding' replace />.
 *   - Otherwise render {children} normally."
 */




import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner full />;

  if (!user) return <Navigate to="/login" replace />;

  if (!user.onboardingComplete && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}