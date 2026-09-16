import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/notes", label: "Notes", icon: "📝" },
  { to: "/flashcards", label: "Flashcards", icon: "🗂️" },
  { to: "/mentor", label: "AI Mentor", icon: "🤖" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme, palette, setPalette, PALETTES } = useTheme();
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const paletteRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (paletteRef.current && !paletteRef.current.contains(e.target)) {
        setShowPaletteMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <motion.nav
      className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-300"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <NavLink to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand to-brand-light flex items-center justify-center text-white shadow-md shadow-brand/20 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <span className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
            Pocket<span className="text-brand ml-0.5">Mentor</span>
          </span>
        </NavLink>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative flex items-center gap-1.5 ${
                  isActive
                    ? "text-brand dark:text-brand-light shadow-sm bg-white dark:bg-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50"
                }`
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Palette Picker */}
          <div className="relative" ref={paletteRef}>
            <motion.button
              onClick={() => setShowPaletteMenu(!showPaletteMenu)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Change theme color"
              aria-label="Change color theme"
            >
              <span
                className="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
                style={{ backgroundColor: PALETTES.find((p) => p.id === palette)?.hex || "#4F46E5" }}
              />
              <span className="text-xs font-semibold hidden sm:inline">Theme</span>
            </motion.button>

            <AnimatePresence>
              {showPaletteMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 space-y-1.5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-0.5">
                    Accent Palette
                  </p>
                  {PALETTES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPalette(p.id);
                        setShowPaletteMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        palette === p.id
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: p.hex }} />
                      <span>{p.name}</span>
                      {palette === p.id && <span className="ml-auto text-brand">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dark / Light Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Toggle dark mode"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </motion.button>

          {/* User badge */}
          {user && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <span className="w-6 h-6 rounded-full bg-brand/15 text-brand font-bold flex items-center justify-center text-[11px]">
                {user.name?.[0]?.toUpperCase() || "U"}
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium max-w-[90px] truncate">
                {user.name}
              </span>
            </div>
          )}

          <button onClick={handleLogout} className="btn-secondary text-xs px-3 py-1.5">
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="md:hidden flex overflow-x-auto gap-1 px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
                isActive
                  ? "bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light font-semibold"
                  : "text-slate-600 dark:text-slate-400"
              }`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
}