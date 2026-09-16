/**
 * pages/Login.jsx
 * Email/password login. On success, AuthContext stores the JWT and
 * ProtectedRoute takes over routing (dashboard vs onboarding).
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-blob [animation-delay:-6s]" />
      </div>

      <div className="card shadow-popup w-full max-w-sm animate-pop-in">
        <h1 className="text-2xl font-serif italic font-medium text-slate-800 mb-1">Welcome back</h1>
        <p className="text-slate-500 text-sm mb-6">Your notes. Your weak points. Your exam plan.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4">
          No account?{" "}
          <Link to="/register" className="text-brand font-medium">
            Register
          </Link>
        </p>
        <p className="text-xs text-slate-400 mt-4">
          Demo login (after running the seed script): demo@pocketmentor.dev / password123
        </p>
      </div>
    </div>
  );
}