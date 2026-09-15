/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F6FA",
        brand: {
          DEFAULT: "#4F46E5",
          light: "#6D64F0",
          dark: "#3F37C9",
        },
        accent: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        serif: ["'Fraunces'", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.08)",
        card: "0 2px 6px -1px rgba(16, 24, 40, 0.07), 0 1px 2px rgba(16, 24, 40, 0.05)",
        lift: "0 16px 32px -12px rgba(79, 70, 229, 0.28)",
        popup: "0 24px 60px -12px rgba(16, 24, 40, 0.35)",
      },
      keyframes: {
        "pop-in": {
          "0%": { opacity: 0, transform: "scale(0.92) translateY(8px)" },
          "100%": { opacity: 1, transform: "scale(1) translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(24px, -32px) scale(1.08)" },
          "66%": { transform: "translate(-20px, 16px) scale(0.95)" },
        },
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        float: "float 5s ease-in-out infinite",
        "float-slow": "float 7s ease-in-out infinite",
        blob: "blob 12s ease-in-out infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};