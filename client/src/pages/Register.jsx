/**
 * pages/Register.jsx
 * Creates a new account, then routes to /onboarding (handled by
 * ProtectedRoute checking user.onboardingComplete).
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-blob [animation-delay:-6s]" />
      </div>

      <div className="card shadow-popup w-full max-w-sm animate-pop-in">
        <h1 className="text-2xl font-serif italic font-medium text-slate-800 mb-1">Create your account</h1>
        <p className="text-slate-500 text-sm mb-6">Start turning your notes into mastery.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="input-field"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-brand font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}