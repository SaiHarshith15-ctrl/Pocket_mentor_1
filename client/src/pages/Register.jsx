import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas text-slate-800 dark:text-slate-100 px-4 relative overflow-hidden transition-colors duration-300">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.14),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.22),rgba(11,15,25,0))]" />
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand/10 dark:bg-brand/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent/10 dark:bg-accent/20 rounded-full blur-3xl animate-blob [animation-delay:-6s]" />
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
            Create your account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Join Pocket Mentor to close your conceptual study gaps.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              className="input-field"
              placeholder="Alex Smith"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              className="input-field"
              type="email"
              placeholder="alex@university.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-danger text-xs font-semibold">{error}</p>}

          <button className="btn-primary w-full py-2.5 text-sm font-semibold shadow-md shadow-brand/20" disabled={loading}>
            {loading ? "Creating account…" : "Create Free Account"}
          </button>
        </form>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-brand font-bold hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}