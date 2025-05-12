/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Включаем поддержку dark mode через классы
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: theme("colors.gray.700"),
            a: {
              color: theme("colors.primary.600"),
              "&:hover": {
                color: theme("colors.primary.700"),
              },
            },
            h1: {
              color: theme("colors.gray.900"),
              marginTop: "1.5em",
              marginBottom: "0.5em",
            },
            h2: {
              color: theme("colors.gray.900"),
              marginTop: "1.5em",
              marginBottom: "0.5em",
            },
            h3: {
              color: theme("colors.gray.900"),
              marginTop: "1.5em",
              marginBottom: "0.5em",
            },
            h4: {
              color: theme("colors.gray.900"),
              marginTop: "1.5em",
              marginBottom: "0.5em",
            },
            p: {
              marginTop: "0.75em",
              marginBottom: "0.75em",
            },
            ul: {
              marginTop: "0.5em",
              marginBottom: "0.5em",
            },
            ol: {
              marginTop: "0.5em",
              marginBottom: "0.5em",
            },
            code: {
              color: theme("colors.gray.700"),
              backgroundColor: theme("colors.gray.100"),
              paddingLeft: "0.25rem",
              paddingRight: "0.25rem",
              paddingTop: "0.125rem",
              paddingBottom: "0.125rem",
              borderRadius: "0.25rem",
            },
            pre: {
              color: theme("colors.gray.700"),
              backgroundColor: theme("colors.gray.100"),
              padding: "1rem",
              borderRadius: "0.5rem",
              overflowX: "auto",
            },
          },
        },
        dark: {
          css: {
            color: theme("colors.gray.300"),
            a: {
              color: theme("colors.primary.500"),
              "&:hover": {
                color: theme("colors.primary.400"),
              },
            },
            h1: {
              color: theme("colors.gray.100"),
            },
            h2: {
              color: theme("colors.gray.100"),
            },
            h3: {
              color: theme("colors.gray.100"),
            },
            h4: {
              color: theme("colors.gray.100"),
            },
            code: {
              color: theme("colors.gray.300"),
              backgroundColor: theme("colors.gray.800"),
            },
            pre: {
              color: theme("colors.gray.300"),
              backgroundColor: theme("colors.gray.800"),
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
