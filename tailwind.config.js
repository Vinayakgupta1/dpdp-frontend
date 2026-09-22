/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "var(--ds-primitive-navy-950)",
          925: "var(--ds-primitive-navy-925)",
          900: "var(--ds-primitive-navy-900)",
          875: "var(--ds-primitive-navy-875)",
          850: "var(--ds-primitive-navy-850)",
          825: "var(--ds-primitive-navy-825)",
          800: "var(--ds-primitive-navy-800)",
          775: "var(--ds-primitive-navy-775)",
          750: "var(--ds-primitive-navy-750)",
          725: "var(--ds-primitive-navy-725)",
          700: "var(--ds-primitive-navy-700)",
          675: "var(--ds-primitive-navy-675)",
          650: "var(--ds-primitive-navy-650)",
          625: "var(--ds-primitive-navy-625)",
          600: "var(--ds-primitive-navy-600)",
        },
        teal: {
          200: "var(--ds-primitive-teal-200)",
          300: "var(--ds-primitive-teal-300)",
          400: "var(--ds-primitive-teal-400)",
          500: "var(--ds-primitive-teal-500)",
          600: "var(--ds-primitive-teal-600)",
        },
        cyan: {
          200: "var(--ds-primitive-cyan-200)",
          300: "var(--ds-primitive-cyan-300)",
          400: "var(--ds-primitive-cyan-400)",
          500: "var(--ds-primitive-cyan-500)",
          600: "var(--ds-primitive-cyan-600)",
        },
        violet: {
          300: "var(--ds-primitive-violet-300)",
          400: "var(--ds-primitive-violet-400)",
          500: "var(--ds-primitive-violet-500)",
          600: "var(--ds-primitive-violet-600)",
        },
        pink: {
          300: "var(--ds-primitive-pink-300)",
          400: "var(--ds-primitive-pink-400)",
          500: "var(--ds-primitive-pink-500)",
        },
        orange: {
          300: "var(--ds-primitive-orange-300)",
          400: "var(--ds-primitive-orange-400)",
          500: "var(--ds-primitive-orange-500)",
        },
        emerald: {
          300: "var(--ds-primitive-emerald-300)",
          400: "var(--ds-primitive-emerald-400)",
          500: "var(--ds-primitive-emerald-500)",
          600: "var(--ds-primitive-emerald-600)",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Share Tech Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        panel: "var(--ds-shadow-elevation-high)",
        glow: "var(--ds-shadow-glow-accent)",
        "glow-lg": "var(--ds-shadow-glow-primary)",
        "glow-premium": "var(--ds-shadow-glow-premium)",
        "glow-teal": "var(--ds-shadow-glow-teal)",
        "glow-violet": "var(--ds-shadow-glow-violet)",
        card: "var(--ds-shadow-elevation-low)",
        "card-hover": "var(--ds-shadow-elevation-medium)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "shimmer-fast": "shimmer 1.2s linear infinite",
        "spin-slow": "spin 3s linear infinite",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(34, 211, 238, 0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(34, 211, 238, 0.25)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
      },
    },
  },
  plugins: [],
};
