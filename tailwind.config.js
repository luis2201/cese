/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        eco: { 700: "#1b4332", 600: "#2d6a4f", 400: "#40916c" },
        itsup: { 600: "#2563eb" },
        base: { 50: "#f6f9fb" },
        ink: "#0b1320",
        muted: "#6b7280",
      },
      boxShadow: {
        soft: "0 8px 22px rgba(0,0,0,.08)",
        card: "0 10px 30px rgba(0,0,0,.15)",
      },
      borderRadius: { xl2: "1rem" },
    },
  },
  plugins: [],
};
