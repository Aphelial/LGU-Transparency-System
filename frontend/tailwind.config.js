/** @type {import('tailwindcss').Config} */
const malachite = {
  50: "rgb(var(--green-50) / <alpha-value>)",
  100: "rgb(var(--green-100) / <alpha-value>)",
  200: "rgb(var(--green-200) / <alpha-value>)",
  300: "rgb(var(--green-300) / <alpha-value>)",
  400: "rgb(var(--green-400) / <alpha-value>)",
  500: "rgb(var(--green-500) / <alpha-value>)",
  600: "rgb(var(--green-600) / <alpha-value>)",
  700: "rgb(var(--green-700) / <alpha-value>)",
  800: "rgb(var(--green-800) / <alpha-value>)",
  900: "rgb(var(--green-900) / <alpha-value>)",
  950: "rgb(var(--green-950) / <alpha-value>)",
};
const slate = {
  50: "rgb(var(--gray-50) / <alpha-value>)",
  100: "rgb(var(--gray-100) / <alpha-value>)",
  200: "rgb(var(--gray-200) / <alpha-value>)",
  300: "rgb(var(--gray-300) / <alpha-value>)",
  400: "rgb(var(--gray-400) / <alpha-value>)",
  500: "rgb(var(--gray-500) / <alpha-value>)",
  600: "rgb(var(--gray-600) / <alpha-value>)",
  700: "rgb(var(--gray-700) / <alpha-value>)",
  800: "rgb(var(--gray-800) / <alpha-value>)",
  900: "rgb(var(--gray-900) / <alpha-value>)",
  950: "rgb(var(--gray-950) / <alpha-value>)",
};

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['"Source Sans 3"', "sans-serif"] },
      colors: {
        malachite,
        green: malachite,
        slate,
        white: "rgb(var(--color-white) / <alpha-value>)",
        gov: {
          forest: "rgb(var(--gov-forest) / <alpha-value>)",
          deep: "rgb(var(--gov-deep) / <alpha-value>)",
          navy: "rgb(var(--gray-900) / <alpha-value>)",
          surface: "rgb(var(--gray-50) / <alpha-value>)",
          mist: "rgb(var(--gray-100) / <alpha-value>)",
        },
      },
      boxShadow: {
        card: "var(--shadow-soft)",
        lift: "var(--shadow-soft)",
      },
      borderRadius: { xl: "var(--radius-card)", "2xl": "var(--radius-card)" },
      keyframes: {
        grow: { "0%": { width: "0%" }, "100%": { width: "var(--w)" } },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        grow: "grow .9s ease-out forwards",
        fadeUp: "fadeUp .35s ease-out both",
      },
    },
  },
  plugins: [],
};
