import type { Config } from "tailwindcss";
const c = (v: string) => `rgb(var(${v}) / <alpha-value>)`;
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { bg: c("--bg"), panel: c("--panel"), ink: c("--ink"), mute: c("--mute"), line: c("--line"), brand: c("--brand") },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
