import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
const YEARS = [1, 2, 3, 4];
const SUBJECT_OPTIONS = ["DSA", "DBMS", "Operating Systems", "Computer Networks", "Machine Learning", "OOP"];

export default function Onboarding() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleSubject(s) {
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSubmit() {
    setError("");
    if (!department || !year || subjects.length === 0) {
      setError("Please select a department, year, and at least one subject.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.put("/users/onboarding", { department, year, subjects });
      updateUser(res.data.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save onboarding info");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-slate-800 dark:text-slate-100 flex items-center justify-center px-4 py-10 relative overflow-hidden transition-colors duration-300">
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
        className="card shadow-popup w-full max-w-lg p-7 space-y-5"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Customize Your Learning Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            This personalizes your weak topic tracking and AI Mentor recommendations.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Department</p>
          <div className="grid grid-cols-3 gap-2">
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDepartment(d)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
                  department === d
                    ? "bg-brand/10 dark:bg-brand/20 border-brand text-brand shadow-sm"
                    : "border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-brand/30"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Academic Year</p>
          <div className="grid grid-cols-4 gap-2">
            {YEARS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
                  year === y
                    ? "bg-brand/10 dark:bg-brand/20 border-brand text-brand shadow-sm"
                    : "border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-brand/30"
                }`}
              >
                Year {y}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Current Semester Subjects</p>
          <div className="grid grid-cols-2 gap-2">
            {SUBJECT_OPTIONS.map((s) => (
              <label
                key={s}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium border cursor-pointer transition-all ${
                  subjects.includes(s)
                    ? "bg-brand/10 dark:bg-brand/20 border-brand text-brand shadow-sm"
                    : "border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-brand/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={subjects.includes(s)}
                  onChange={() => toggleSubject(s)}
                  className="accent-brand"
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-danger text-xs font-semibold">{error}</p>}

        <button className="btn-primary w-full py-2.5 text-sm font-semibold shadow-md shadow-brand/20" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving Profile…" : "Continue to Dashboard →"}
        </button>
      </motion.div>
    </div>
  );
}