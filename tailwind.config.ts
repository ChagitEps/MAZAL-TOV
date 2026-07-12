import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Hebrew-first UI stack. PDF stage embeds print fonts (פרנק-רול, היבו, דוד) — spec §12.
        sans: ["Heebo", "Assistant", "Arial Hebrew", "Arial", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#7c3aed",
          fg: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
