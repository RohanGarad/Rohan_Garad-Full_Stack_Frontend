/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        shake: "shake 0.5s ease-in-out infinite",
        sparkle: "sparkle 1s infinite linear",
        "sparkle-delay": "sparkle 1s infinite linear 0.2s",
        "sparkle-delay-2": "sparkle 1s infinite linear 0.4s",
        pulse: "pulse 1.5s infinite",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
          "75%": { transform: "rotate(-5deg)" },
        },
        sparkle: {
          "0%, 100%": { transform: "translate(-5px, -5px)", opacity: "0.6" },
          "50%": { transform: "translate(5px, 5px)", opacity: "1" },
        },
      },
    },
  },


  plugins: [],
}

