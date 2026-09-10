/**
 * components/Navbar.jsx
 *
 * PURPOSE:
 * Top navigation shown on every protected page (App.jsx's <Layout>
 * wraps Dashboard/Notes/Flashcards/Quiz/RescueMode/AIMentor/Profile with
 * <Navbar /> above the page content).
 *
 * CONNECTS TO:
 * - context/AuthContext.jsx (useAuth() for current user's name + logout())
 * - react-router-dom (NavLink for active-route highlighting)
 *
 * NOT YET IMPLEMENTED — build this file yourself, or hand the prompt
 * below to an AI assistant:
 *
 * PROMPT TO GENERATE THIS FILE:
 * "Create a Navbar component styled with Tailwind (dark bg-slate-900/950,
 * border-b border-slate-800) containing:
 *   - The 'Pocket Mentor' brand/logo on the left, linking to /dashboard.
 *   - NavLink items (react-router-dom) for: Dashboard (/dashboard),
 *     Notes (/notes), Flashcards (/flashcards), AI Mentor (/mentor),
 *     Profile (/profile). Give the active link a highlighted style
 *     (e.g. text-brand-light) via NavLink's isActive render prop.
 *   - The current user's name (from useAuth()) and a Logout button on
 *     the right that calls logout() from useAuth() and navigates to
 *     /login.
 *   - Collapse into a simple mobile-friendly layout (hide labels or
 *     use a hamburger) if you want it responsive — not required for
 *     the hackathon demo."
 */




import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/notes", label: "Notes" },
  { to: "/flashcards", label: "Flashcards" },
  { to: "/mentor", label: "AI Mentor" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/dashboard" className="font-bold text-brand-light">
          Pocket Mentor
        </NavLink>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}

              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive ? "bg-brand/20 text-brand-light" : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user && <span className="text-sm text-slate-400 hidden sm:inline">{user.name}</span>}
          <button onClick={handleLogout} className="btn-secondary text-sm py-1">
            Logout
          </button>
        </div>
      </div>

      <div className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive ? "bg-brand/20 text-brand-light" : "text-slate-400"
              }`
            }
          >
            {link.label}
          </NavLink>

        ))}
      </div>
    </nav>
  );
}