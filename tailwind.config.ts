import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#111827", // Main background (dark gray)
        foreground: "#ffffff", // Primary text color (white)
        primary: "#152345",   // Foreground for inputs, cards (dark blue-gray)
        cta: "#2563eb",       // CTA buttons (blue)
        ctaHover: "#1d4ed8",  // CTA hover state
      },
      fontFamily: {
        bricolage: ["Bricolage Grotesque", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
