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
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/dashboard" className="font-bold text-brand">
          Pocket Mentor
        </NavLink>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-brand/10 text-brand" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user && <span className="text-sm text-slate-500 hidden sm:inline">{user.name}</span>}
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
                isActive ? "bg-brand/10 text-brand" : "text-slate-500"
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