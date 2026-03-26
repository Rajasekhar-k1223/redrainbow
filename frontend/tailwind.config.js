/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0d14",
        haze: "#f2f4f8",
        glass: "rgba(255,255,255,0.6)",
        brand: "#2563eb",
        accent: "#16a34a",
        amber: "#f59e0b",
        rose: "#ef4444",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(2, 6, 23, 0.08)",
      },
    },
  },
  plugins: [],
};