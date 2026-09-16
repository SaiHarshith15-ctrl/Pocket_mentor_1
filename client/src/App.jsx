/**
 * App.jsx
 * Top-level route table. Public routes: /login, /register. Everything
 * else is wrapped in ProtectedRoute, which also enforces onboarding
 * completion.
 */
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "./context/ThemeContext";
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
    <div className="min-h-screen bg-canvas text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      {/* Ambient background with delicate mesh glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(11,15,25,0))]" />
        <div className="absolute -top-32 -left-24 w-96 h-96 bg-brand/10 dark:bg-brand/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-accent/10 dark:bg-accent/15 rounded-full blur-3xl animate-blob [animation-delay:-5s]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-brand/10 dark:bg-brand/20 rounded-full blur-3xl animate-blob [animation-delay:-9s]" />
      </div>

      <Navbar />
      <motion.main
        className="max-w-6xl mx-auto px-4 py-8 relative"
        variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 } }}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {children}
      </motion.main>
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
  const location = useLocation();
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <AppRoutes key={location.pathname} />
        </AnimatePresence>
      </AuthProvider>
    </ThemeProvider>
  );
}