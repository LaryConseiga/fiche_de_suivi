/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ── InnoFaso Brand ── */
        primary: {
          50:  "#EEF7EF",
          100: "#D5EDD7",
          200: "#ABDCAF",
          300: "#76C47C",
          400: "#4AAD52",
          500: "#2D7A3A",   // vert logo principal
          600: "#246431",
          700: "#1B4D25",
          800: "#123619",
          900: "#091F0D",
        },
        leaf: {
          400: "#6AAF3D",   // vert clair feuille
          500: "#5A9C30",
        },
        gold: {
          400: "#F9C22B",   // étoile drapeau BF
          500: "#F5A623",
          600: "#D4881A",
        },
        danger: {
          400: "#E53935",   // rouge drapeau BF
          500: "#C62828",
          600: "#B71C1C",
        },
        surface: "#F2F8F3",    // fond général léger vert
        panel:   "#FFFFFF",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 4px 0 rgba(45,122,58,0.10)",
        alert: "0 2px 8px 0 rgba(198,40,40,0.15)",
      },
    },
  },
  plugins: [],
};
