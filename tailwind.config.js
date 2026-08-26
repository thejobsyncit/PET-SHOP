/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1D3B2E', // Softer deep sage/forest
          light: '#2E5947',
          dark: '#0F241C',
        },
        secondary: {
          DEFAULT: '#FAFBF9', // Sage milk white / ivory
          dark: '#DFE5DF',    // Lite sage beige
          light: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#7CA085', // Premium lite sage green
          dark: '#5D8066',
          light: '#A1C0AA',
        },
        charcoal: '#2C3A33',
        sand: '#F1F6F2',      // Lite sage sand
        beige: '#E3EBE5',     // Lite sage border
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Outfit"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(15, 46, 35, 0.08)',
        'premium-hover': '0 20px 40px -15px rgba(15, 46, 35, 0.15)',
      }
    },
  },
  plugins: [],
}
