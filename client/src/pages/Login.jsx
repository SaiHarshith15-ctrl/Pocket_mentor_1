import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas text-slate-800 dark:text-slate-100 px-4 relative overflow-hidden transition-colors duration-300">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.14),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.22),rgba(11,15,25,0))]" />
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand/10 dark:bg-brand/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-accent/10 dark:bg-accent/20 rounded-full blur-3xl animate-blob [animation-delay:-6s]" />
      </div>

      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shadow-sm"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card shadow-popup w-full max-w-sm p-7 space-y-4"
      >
        <div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-brand-light flex items-center justify-center text-white font-bold text-lg mb-3 shadow-md shadow-brand/20">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Turn your lecture notes into effortless exam mastery.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              className="input-field"
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-danger text-xs font-semibold">{error}</p>}

          <button className="btn-primary w-full py-2.5 text-sm font-semibold shadow-md shadow-brand/20" disabled={loading}>
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand font-bold hover:underline">
            Register free
          </Link>
        </p>
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
          Demo login: <code className="text-brand font-semibold">demo@pocketmentor.dev</code> / <code className="text-brand font-semibold">password123</code>
        </div>
      </motion.div>
    </div>
  );
}