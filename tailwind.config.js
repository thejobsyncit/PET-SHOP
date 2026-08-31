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
        charcoal: '#212B26', // Deepened slightly for higher contrast
        sand: '#F7FAF8',      // Lightened sand
        beige: '#E3EBE5',     // Lite sage border
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F3E5AB',
          dark: '#AA8C2C',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Outfit"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(15, 46, 35, 0.05), 0 0 3px rgba(15, 46, 35, 0.02)',
        'premium-hover': '0 20px 40px -8px rgba(15, 46, 35, 0.12), 0 0 10px rgba(15, 46, 35, 0.04)',
        'premium-soft': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #1D3B2E 0%, #2E5947 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F3E5AB 0%, #D4AF37 100%)',
        'gradient-radial-sage': 'radial-gradient(circle at center, #F7FAF8 0%, #E3EBE5 100%)',
      }
    },
  },
  plugins: [],
}
