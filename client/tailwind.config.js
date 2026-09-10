/**
 * tailwind.config.js
 *
 * PURPOSE:
 * Configures Tailwind's content scanning paths and extends the default
 * theme with the custom `brand` color palette every page already
 * references (text-brand-light, bg-brand, border-brand, from-brand,
 * to-brand, bg-brand/20, etc. appear throughout Login, Dashboard,
 * Onboarding, Notes, Quiz, RescueMode, Profile...).
 *
 * CONNECTS TO:
 * - src/index.css (the file that actually invokes @tailwind directives)
 * - postcss.config.js (wires Tailwind into the PostCSS pipeline)
 * - every .jsx file under src/ (Tailwind's `content` globs must include
 *   them or classes get purged in production builds)
 *
 * NOT YET IMPLEMENTED — build this file yourself, or hand the prompt
 * below to an AI assistant:
 *
 * PROMPT TO GENERATE THIS FILE:
 * "Create tailwind.config.js with module.exports = { content: ['./index.html',
 * './src/**\/*.{js,jsx}'], theme: { extend: { colors: { brand: { DEFAULT:
 * '#6366f1', light: '#818cf8' } } } }, plugins: [] }. Pick any indigo/violet
 * shade you like for `brand` and `brand-light` — they just need to exist
 * so classes like bg-brand and text-brand-light used throughout the
 * pasted pages resolve to real colors instead of being ignored."
 */



/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6366f1",
          light: "#818cf8",
        },
      },
    },
  },
  plugins: [],
};