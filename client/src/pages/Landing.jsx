import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { motion, useInView, AnimatePresence, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";

/* ─── Animated Counter Component ─── */
function AnimatedCounter({ target, duration = 2, suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const ctrl = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [isInView, target, duration]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─── Features Data ─── */
const FEATURES = [
  {
    icon: "📝",
    title: "Smart Note Ingestion",
    description: "Upload lecture PDFs or paste raw text. PocketMentor automatically extracts structured summaries, key technical terms, flashcard sets, and practice quizzes in seconds.",
    gradient: "from-indigo-500 to-purple-600",
    badge: "AI Powered",
  },
  {
    icon: "🧠",
    title: "Adaptive Knowledge Map",
    description: "Visualize every syllabus concept mapped in real-time. Color-coded nodes show exactly what you've mastered, what's in progress, and what needs immediate attention.",
    gradient: "from-emerald-500 to-teal-600",
    badge: "Real-Time",
  },
  {
    icon: "🚑",
    title: "Instant Rescue Mode",
    description: "Struggled with an exam topic? One click launches a targeted micro-revision sprint with crystal-clear explanations, targeted flashcards, and instant re-quizzes.",
    gradient: "from-rose-500 to-pink-600",
    badge: "High Yield",
  },
  {
    icon: "🤖",
    title: "AI Mentor Chat",
    description: "Have 20 minutes before class? Your personal AI tutor drafts an instant high-priority study sprint tailored to your current weakest concepts.",
    gradient: "from-amber-500 to-orange-600",
    badge: "24/7 Available",
  },
  {
    icon: "📊",
    title: "Exam Readiness Gauges",
    description: "Multi-subject probability scores give you a confident, data-backed assessment of your preparedness before walking into the examination hall.",
    gradient: "from-cyan-500 to-blue-600",
    badge: "Predictive",
  },
  {
    icon: "⚡",
    title: "Error Pattern Analysis",
    description: "Deep analytics trace recurring mistakes and conceptual blind spots across past quizzes, prescribing the exact next action to overcome them.",
    gradient: "from-violet-500 to-fuchsia-600",
    badge: "Deep Insights",
  },
];

/* ─── Engineering Subjects Data ─── */
const SUBJECTS = [
  {
    code: "OS",
    name: "Operating Systems",
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    topics: ["CPU Scheduling (Round Robin, FCFS)", "Process Synchronization & Mutex", "Deadlock 4 Conditions (Coffman)", "Memory Management & Paging"],
  },
  {
    code: "DBMS",
    name: "Database Systems",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    topics: ["Relational Normalization (1NF to BCNF)", "ACID Properties & Recovery", "B+ Tree Indexing & Hash Indices", "Transactions & Concurrency Control"],
  },
  {
    code: "CN",
    name: "Computer Networks",
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    topics: ["OSI 7-Layer Architecture", "TCP 3-Way Handshake vs UDP", "Subnetting & CIDR Calculation", "Routing Algorithms & Flow Control"],
  },
  {
    code: "DSA",
    name: "Data Structures & Algorithms",
    color: "from-purple-500 to-violet-600",
    bgLight: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    topics: ["Binary Search Trees & AVL Balancing", "Graph Traversals (BFS & DFS)", "Dynamic Programming Paradigms", "Time & Space Asymptotic Complexity"],
  },
];

/* ─── How It Works Steps ─── */
const STEPS = [
  {
    step: "01",
    title: "Ingest Your Notes",
    desc: "Paste lecture text or drop in slide PDFs. Our intelligent parser categorizes topics and isolates core formulas and definitions.",
    icon: "📄",
  },
  {
    step: "02",
    title: "Diagnose & Map",
    desc: "Take quick diagnostic quizzes. The system builds your personalized knowledge graph and highlights critical weak zones.",
    icon: "🎯",
  },
  {
    step: "03",
    title: "Rescue & Master",
    desc: "Targeted rescue sessions eliminate confusion with high-yield flashcards until your Exam Readiness score reaches 85%+.",
    icon: "🚀",
  },
];

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  {
    quote: "PocketMentor helped me jump from 52% to 88% on my Operating Systems final. The Rescue Mode broke down CPU scheduling until it finally clicked.",
    author: "Arjun Verma",
    dept: "Computer Science & Eng, 3rd Year",
    avatar: "👨‍💻",
    score: "+36% Score Lift",
  },
  {
    quote: "The interactive knowledge map gives me an instant reality check before exams. I no longer waste hours revising things I already know.",
    author: "Sneha Reddy",
    dept: "Information Technology, 2nd Year",
    avatar: "👩‍🎓",
    score: "94% Exam Readiness",
  },
  {
    quote: "The AI Mentor chat is incredible. I told it I had 30 minutes before my DBMS test and it generated a lightning sprint on BCNF and ACID properties.",
    author: "Rohan Nair",
    dept: "Electronics & Comm, 4th Year",
    avatar: "⚡",
    score: "Saved 6 hrs/week",
  },
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  // Modal Auth State
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Demo interactive flashcard state
  const [cardFlipped, setCardFlipped] = useState(false);

  // Handle Auth Form Submission
  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      if (authModal === "login") {
        await login(email, password);
      } else {
        await register(name || "Student", email, password);
      }
      setAuthModal(null);
      navigate("/dashboard");
    } catch (err) {
      setAuthError(err.response?.data?.message || (authModal === "login" ? "Login failed" : "Registration failed"));
    } finally {
      setAuthLoading(false);
    }
  }

  function fillDemo() {
    setEmail("demo@pocketmentor.dev");
    setPassword("password123");
  }

  return (
    <div className="min-h-screen bg-canvas text-slate-800 dark:text-slate-100 overflow-x-hidden relative transition-colors duration-300">
      {/* ─── Ambient Animated Backdrop ─── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_85%_80%_at_50%_-20%,rgba(99,102,241,0.28),rgba(11,15,25,0))]" />
        {/* Floating gradient orbs */}
        <motion.div
          className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-brand/15 dark:bg-brand/25 rounded-full blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-accent/15 dark:bg-accent/20 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: "easeInOut", delay: 4 }}
        />
      </div>

      {/* ─── Header Navigation ─── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800/70 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand via-brand-light to-accent flex items-center justify-center text-white shadow-lg shadow-brand/25 text-lg font-bold">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-900 dark:text-slate-50 tracking-tight">
                Pocket<span className="text-brand">Mentor</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-brand/10 text-brand dark:bg-brand/20">
                AI Exam Suite
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#preview" className="hover:text-brand transition-colors">App Preview</a>
            <a href="#features" className="hover:text-brand transition-colors">Core Features</a>
            <a href="#subjects" className="hover:text-brand transition-colors">Subjects</a>
            <a href="#how-it-works" className="hover:text-brand transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-brand transition-colors">Student Results</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm text-sm"
              title="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {user ? (
              <Link to="/dashboard" className="btn-primary text-xs sm:text-sm py-2 px-5 shadow-md shadow-brand/25">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <button
                  onClick={() => { setAuthModal("login"); setAuthError(""); }}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-brand dark:hover:text-brand transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthModal("register"); setAuthError(""); }}
                  className="btn-primary text-xs sm:text-sm py-2 px-5 shadow-lg shadow-brand/25 hover:scale-105 active:scale-95 transition-all"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20 md:pt-16 md:pb-28">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
            <span>Built for Computer Science & Engineering Students</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]"
          >
            Turn raw lecture notes into{" "}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-light to-accent">
              effortless exam mastery
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto"
          >
            Upload your syllabus or lecture notes. PocketMentor maps your conceptual strengths, detects blindspots with diagnostic quizzes, and launches targeted Rescue Sessions before exam day.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <button
              onClick={() => { setAuthModal("register"); setAuthError(""); }}
              className="btn-primary text-base font-bold py-3.5 px-8 shadow-xl shadow-brand/30 hover:shadow-brand/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <span className="text-lg">→</span>
            </button>
            <button
              onClick={() => { setAuthModal("login"); setAuthError(""); }}
              className="btn-secondary text-base font-bold py-3.5 px-7 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Sign In to Account
            </button>
          </motion.div>

          {/* Trust points */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            <span className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> No credit card required</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Free Instant Demo</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> OS, DBMS, CN & DSA ready</span>
          </motion.div>
        </div>

        {/* ─── High-Resolution App Screenshot Showcase with Floating Badges ─── */}
        <div id="preview" className="relative mt-14 max-w-5xl mx-auto">
          {/* Subtle Ambient Glow behind app window */}
          <div className="absolute -inset-4 bg-gradient-to-r from-brand/30 via-accent/25 to-purple-600/30 rounded-3xl blur-2xl opacity-75 -z-10" />

          {/* Realistic Window Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800/90 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden"
          >
            {/* Window Topbar */}
            <div className="px-4 py-3 bg-slate-100/90 dark:bg-slate-950/90 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs font-mono text-slate-400 ml-2 hidden sm:inline">pocket-mentor.app/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Student Workspace</span>
              </div>
            </div>

            {/* High-Resolution App Screenshot Image */}
            <div className="relative group overflow-hidden">
              <img
                src="/assets/app_preview.jpg"
                alt="PocketMentor Application Dashboard Preview"
                className="w-full h-auto object-cover object-top transition-transform duration-700 group-hover:scale-[1.01]"
              />

              {/* Interactive Screenshot Overlay Banner */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent flex flex-wrap items-center justify-between text-white text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-brand text-white font-bold text-[11px] shadow-sm">
                    Interactive Command Center
                  </span>
                  <span className="font-medium text-slate-200 hidden sm:inline">
                    Featuring Real-time Knowledge Maps, Rescue Mode & Predictive Exam Readiness
                  </span>
                </div>
                <button
                  onClick={() => { setAuthModal("register"); setAuthError(""); }}
                  className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs transition-colors"
                >
                  Explore Dashboard →
                </button>
              </div>
            </div>
          </motion.div>

          {/* ─── Floating Dynamic Badges around Screenshot ─── */}
          {/* Badge 1: Exam Readiness (Top Right) */}
          <motion.div
            className="absolute -top-8 -right-4 sm:-right-8 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-brand/30 shadow-xl backdrop-blur-xl z-20"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg">
              🎯
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Exam Readiness</p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>88% Ready</span>
                <span className="text-xs text-emerald-500 font-bold">▲ +14%</span>
              </p>
            </div>
          </motion.div>

          {/* Badge 2: Rescue Mode Alert (Bottom Left) */}
          <motion.div
            className="absolute -bottom-8 -left-4 sm:-left-8 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-rose-500/30 shadow-xl backdrop-blur-xl z-20"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-lg">
              🚑
            </div>
            <div>
              <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                Rescue Mode Activated
              </p>
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                Round Robin Scheduling <span className="text-emerald-500">(+40% Lift)</span>
              </p>
            </div>
          </motion.div>

          {/* Badge 3: Streak Tracker (Top Left) */}
          <motion.div
            className="absolute top-1/3 -left-6 hidden md:flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-amber-500/30 shadow-lg backdrop-blur-xl z-20"
            animate={{ x: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1.5 }}
          >
            <span className="text-lg">🔥</span>
            <div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">14-Day Study Streak</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Consistency +25% Retention</p>
            </div>
          </motion.div>
        </div>

        {/* ─── Metric Counter Badges ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-5xl mx-auto">
          {[
            { label: "Flashcards Generated", value: 1200, suffix: "+" },
            { label: "Diagnostic Quizzes Taken", value: 450, suffix: "+" },
            { label: "Average Mastery Lift", value: 34, suffix: "%" },
            { label: "Core Subjects Supported", value: 4, suffix: " Disciplines" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-5 text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-sm"
            >
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Interactive Feature Cards ─── */}
      <section id="features" className="py-20 bg-slate-50/50 dark:bg-slate-950/40 border-y border-slate-200/50 dark:border-slate-800/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="px-3.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold border border-brand/20">
              Complete Study Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for Deep Retention & Exam Confidence
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Everything you need to master your technical course materials without the pre-exam panic.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className="card p-6 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{f.icon}</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {f.description}
                  </p>
                </div>
                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-brand">
                  <span>Explore capability</span>
                  <span>→</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Core Subjects Showcase ─── */}
      <section id="subjects" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
            Tailored Curriculum
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Curated Domain Dictionaries for Core CS Subjects
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            PocketMentor isn't a generic chatbot. It features specialized models and verification algorithms for major university branches.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUBJECTS.map((sub, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-5 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs border ${sub.bgLight}`}>
                    {sub.code}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Active Syllabus</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">{sub.name}</h3>
                <ul className="space-y-2">
                  {sub.topics.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => { setAuthModal("register"); setAuthError(""); }}
                className="mt-5 w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand hover:text-white dark:hover:bg-brand dark:hover:text-white text-xs font-bold transition-all text-slate-700 dark:text-slate-300"
              >
                Study {sub.code} →
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Interactive Live Flashcard Preview Demo ─── */}
      <section className="py-16 bg-gradient-to-b from-slate-50/70 to-white dark:from-slate-950/60 dark:to-slate-900 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20">
            Try It Now
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 mb-3">
            Experience Active Recall in Real-Time
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
            Click the flashcard below to test your understanding of Operating Systems Scheduling:
          </p>

          <motion.div
            onClick={() => setCardFlipped(!cardFlipped)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-brand/30 shadow-popup relative transition-all min-h-[220px] flex flex-col items-center justify-center text-center select-none"
          >
            <span className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand/10 text-brand">
              {cardFlipped ? "Answer" : "Question · Click to Flip"}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Operating Systems · CPU Scheduling</span>

            <AnimatePresence mode="wait">
              {!cardFlipped ? (
                <motion.div
                  key="front"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    What is the primary trade-off when selecting the Time Quantum in Round Robin scheduling?
                  </p>
                  <p className="text-xs text-brand font-medium">💡 Click to reveal key concept</p>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    If the quantum is too large, Round Robin degenerates into FCFS (poor response time). If too small, context-switching overhead dominates CPU utilization.
                  </p>
                  <p className="text-xs text-emerald-500 font-bold">✓ Mastered in Rescue Session</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works Timeline ─── */}
      <section id="how-it-works" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-14">
          <span className="px-3.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold border border-brand/20">
            Simple 3-Step Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            From Confusing Slides to 100% Prepared
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="card p-6 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand/10 dark:bg-brand/20 text-brand font-extrabold text-xl flex items-center justify-center mb-4">
                {step.step}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-20 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-14">
            <span className="px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
              Student Endorsements
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Trusted by Ambitious Engineering Students
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="card p-6 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{t.avatar}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      {t.score}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{t.author}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.dept}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ─── */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-tr from-brand via-indigo-600 to-accent text-white shadow-2xl relative overflow-hidden text-center space-y-6">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Ready to Conquer Your Next Technical Exam?
            </h2>
            <p className="text-base sm:text-lg text-indigo-100 max-w-xl mx-auto leading-relaxed">
              Join students mastering Operating Systems, Databases, Computer Networks, and Data Structures in less than half the study time.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => { setAuthModal("register"); setAuthError(""); }}
                className="px-8 py-3.5 rounded-xl bg-white text-brand hover:bg-slate-50 font-bold text-base shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Create Free Account →
              </button>
              <button
                onClick={() => { setAuthModal("login"); setAuthError(""); }}
                className="px-7 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-base transition-all"
              >
                Sign In to Existing Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center text-white text-xs font-bold">
              ⚡
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">PocketMentor</span>
            <span>— AI Exam Mastery Platform</span>
          </div>
          <p>© {new Date().getFullYear()} PocketMentor. All rights reserved.</p>
        </div>
      </footer>

      {/* ════════════════════════════════════════════════════════════════════
          AUTHENTICATION MODAL
          Matches the exact requested card layout and appears when
          clicking 'Sign In' or 'Get Started'
         ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {authModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            {/* Backdrop click to dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModal(null)}
              className="absolute inset-0"
            />

            {/* Auth Card (Matches exact UI appearance from user's screenshot) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative card shadow-popup w-full max-w-sm p-7 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-10"
            >
              {/* Close button */}
              <button
                onClick={() => setAuthModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
                title="Close"
              >
                ✕
              </button>

              {/* Logo / Title */}
              <div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-brand-light flex items-center justify-center text-white font-bold text-lg mb-3 shadow-md shadow-brand/20">
                  ⚡
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  {authModal === "login" ? "Welcome back" : "Create an account"}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  Turn your lecture notes into effortless exam mastery.
                </p>
              </div>

              {authError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {authModal === "register" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Chen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input w-full"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input w-full"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-primary w-full py-2.5 text-sm font-semibold shadow-md shadow-brand/20 mt-2"
                >
                  {authLoading ? "Please wait..." : authModal === "login" ? "Log In" : "Create Account"}
                </button>
              </form>

              {/* Toggle switch between login / register */}
              <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                {authModal === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setAuthModal("register"); setAuthError(""); }}
                      className="text-brand font-bold hover:underline ml-1"
                    >
                      Register free
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setAuthModal("login"); setAuthError(""); }}
                      className="text-brand font-bold hover:underline ml-1"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>

              {/* Demo Login shortcut */}
              {authModal === "login" && (
                <div
                  onClick={fillDemo}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 text-center cursor-pointer hover:border-brand/40 transition-colors"
                >
                  Demo login: <span className="text-brand font-mono font-semibold">demo@pocketmentor.dev</span> / <span className="text-brand font-mono font-semibold">password123</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}