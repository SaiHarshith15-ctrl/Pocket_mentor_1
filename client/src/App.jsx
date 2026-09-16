/**
 * App.jsx
 * Top-level route table. Public routes: /login, /register. Everything
 * else is wrapped in ProtectedRoute, which also enforces onboarding
 * completion.
 */
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import Flashcards from "./pages/Flashcards";
import Quiz from "./pages/Quiz";
import RescueMode from "./pages/RescueMode";
import AIMentor from "./pages/AIMentor";
import Profile from "./pages/Profile";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-canvas relative overflow-hidden">
      {/* Ambient background — same blob treatment as the landing page,
          fixed so it doesn't scroll away, and far enough back
          (pointer-events-none, low opacity, blurred) that it never
          competes with the actual content. */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-accent/10 rounded-full blur-3xl animate-blob [animation-delay:-5s]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-blob [animation-delay:-9s]" />
      </div>

      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 relative">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Layout>
              <Notes />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/flashcards"
        element={
          <ProtectedRoute>
            <Layout>
              <Flashcards />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:quizId"
        element={
          <ProtectedRoute>
            <Layout>
              <Quiz />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rescue/:topicId"
        element={
          <ProtectedRoute>
            <Layout>
              <RescueMode />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor"
        element={
          <ProtectedRoute>
            <Layout>
              <AIMentor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}