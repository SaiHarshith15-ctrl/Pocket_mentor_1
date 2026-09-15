/**
 * pages/Onboarding.jsx
 * Collects department, year, and subjects. Submits to
 * PUT /api/users/onboarding, then routes to the dashboard.
 */
/**
 * pages/Onboarding.jsx
 * Collects department, year, and subjects. Submits to
 * PUT /api/users/onboarding, then routes to the dashboard.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
const YEARS = [1, 2, 3, 4];
const SUBJECT_OPTIONS = ["DSA", "DBMS", "Operating Systems", "Computer Networks", "Machine Learning", "OOP"];

export default function Onboarding() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-10">
      <div className="card shadow-popup w-full max-w-lg animate-pop-in">
        <h1 className="text-2xl font-serif italic font-medium text-slate-800 mb-1">Set up your profile</h1>
        <p className="text-slate-500 text-sm mb-6">This shapes your dashboard recommendations.</p>

        <div className="mb-5">
          <p className="text-sm font-semibold text-slate-700 mb-2">Department</p>
          <div className="grid grid-cols-3 gap-2">
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                onClick={() => setDepartment(d)}
                className={`rounded-xl px-3 py-2 text-sm border transition-all hover:-translate-y-0.5 ${
                  department === d
                    ? "bg-brand/10 border-brand text-brand shadow-soft"
                    : "border-slate-200 text-slate-600 hover:border-brand/30"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-sm font-semibold text-slate-700 mb-2">Year</p>
          <div className="grid grid-cols-4 gap-2">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`rounded-xl px-3 py-2 text-sm border transition-all hover:-translate-y-0.5 ${
                  year === y
                    ? "bg-brand/10 border-brand text-brand shadow-soft"
                    : "border-slate-200 text-slate-600 hover:border-brand/30"
                }`}
              >
                Year {y}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-700 mb-2">Subjects</p>
          <div className="grid grid-cols-2 gap-2">
            {SUBJECT_OPTIONS.map((s) => (
              <label
                key={s}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm border cursor-pointer transition-all hover:-translate-y-0.5 ${
                  subjects.includes(s)
                    ? "bg-brand/10 border-brand text-brand shadow-soft"
                    : "border-slate-200 text-slate-600 hover:border-brand/30"
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

        {error && <p className="text-danger text-sm mb-3">{error}</p>}
        <button className="btn-primary w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving…" : "Continue to Dashboard"}
        </button>
      </div>
    </div>
  );
}