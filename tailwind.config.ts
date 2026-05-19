import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        graphite: "#293241",
        line: "#E5E7EB",
        mist: "#F7F8FA",
        coral: "#D95D39",
        teal: "#2A9D8F",
        gold: "#E9C46A"
      },
      boxShadow: {
        panel: "0 12px 40px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
