/**
 * vite.config.js
 *
 * PURPOSE:
 * Configures the Vite dev server / build for this React app. Needed so
 * `npm run dev` (see package.json scripts) knows to use the React
 * plugin (JSX transform, fast refresh).
 *
 * CONNECTS TO:
 * - package.json (devDependency "@vitejs/plugin-react" is already listed
 *   and expects this config to import + use it)
 * - index.html / src/main.jsx (the app Vite serves/builds)
 *
 * NOT YET IMPLEMENTED — build this file yourself, or hand the prompt
 * below to an AI assistant:
 *
 * PROMPT TO GENERATE THIS FILE:
 * "Create a standard Vite config for a React app: import { defineConfig }
 * from 'vite' and react from '@vitejs/plugin-react', export default
 * defineConfig({ plugins: [react()] }). Optionally set server.port to
 * 5173 explicitly (Vite's default) and server.proxy to forward '/api'
 * requests to http://localhost:5000 during development if you'd rather
 * not hardcode the backend URL in services/api.js."
 */



import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});