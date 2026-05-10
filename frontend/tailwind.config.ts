import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#1f2933",
        paper: "#f6f4ef",
        clay: "#b45335",
        moss: "#3f6f55",
        amber: "#c58b28",
        graphite: "#374151"
      },
      boxShadow: {
        card: "0 12px 28px rgba(31, 41, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
