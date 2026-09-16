/**
 * services/api.js
 *
 * PURPOSE:
 * Single shared axios instance used by every page (Login, Register,
 * Onboarding, Dashboard, Notes, Flashcards, Quiz, RescueMode, AIMentor,
 * Profile) and by components/SmartTerm.jsx. Every existing page already
 * imports this as `import api from "../services/api"` and calls
 * api.get/api.post/api.put — this file is the missing piece that makes
 * those calls actually reach the backend.
 *
 * CONNECTS TO:
 * - server: every /api/* route in server/routes/*.js
 * - context/AuthContext.jsx (reads/writes the stored JWT this file sends)
 *
 * NOT YET IMPLEMENTED — build this file yourself, or hand the prompt
 * below to an AI assistant:
 *
 * PROMPT TO GENERATE THIS FILE:
 * "Create an axios instance (services/api.js) with:
 *   - baseURL: import.meta.env.VITE_API_URL, falling back to
 *     'http://localhost:5000/api' if the env var isn't set.
 *   - A request interceptor that reads a JWT from
 *     localStorage.getItem('pocketMentorToken') and, if present, sets
 *     the `Authorization: Bearer <token>` header on every outgoing
 *     request.
 *   - A response interceptor that, when a response comes back with
 *     status 401 (token missing/expired/invalid — matches
 *     middleware/auth.js on the backend), clears the stored token
 *     (localStorage.removeItem) and redirects the browser to /login.
 *   - Export the configured instance as the default export so
 *     `import api from './services/api'` works everywhere it's already
 *     used."
 */



import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Attach the JWT (if we have one) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pocketMentorToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is missing/expired, clear it and bounce to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("pocketMentorToken");
      const publicPaths = ["/", "/login", "/register"];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;