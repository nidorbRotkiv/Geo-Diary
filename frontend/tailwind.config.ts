import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        md_lg: "896px",
      },
      colors: {
        "dark-bg": "#222",
        "dark-primary": "#E0E0E0",
        "dark-secondary": "#BDBDBD",
        "dark-accent": "#BB86FC",
        "dark-error": "#CF6679",
        "dark-button": "#333333",
        "dark-button-text": "#FFFFFF",
        "dark-hover": "#444444",
        "dark-disabled": "#2E2E2E",
        "dark-border": "#292929",
        "dark-divider": "#424242",
        "dark-info": "#2196F3",
        "dark-success": "#4CAF50",
        "dark-warning": "#FFC107",
        "dark-body": "#1d232a",
        "dark-google": "#131314",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      zIndex: {
        "2000": "2000",
        "1000": "1000",
        "900": "900",
      },
    },
  },
  plugins: [require("daisyui")],
};

export default config;
