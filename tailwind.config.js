/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Accents glassmorphism (identiques clair/sombre, utilisés en dégradés/glow)
        violet:   { DEFAULT: '#8B5CF6', 500: '#8B5CF6', 600: '#7C3AED' },
        electric: { DEFAULT: '#3B82F6', 500: '#3B82F6', 600: '#2563EB' },
        cyan:     { DEFAULT: '#22D3EE', 500: '#22D3EE', 600: '#06B6D4' },
        magenta:  { DEFAULT: '#D946EF', 500: '#D946EF', 600: '#C026D3' },
        // Surfaces & texte pilotés par variables CSS (theme-aware) — voir index.css
        surface:      'rgb(var(--surface) / <alpha-value>)',
        'surface-2':  'rgb(var(--surface-2) / <alpha-value>)',
        ink:          'rgb(var(--ink) / <alpha-value>)',
        'ink-muted':  'rgb(var(--ink-muted) / <alpha-value>)',
        'ink-faint':  'rgb(var(--ink-faint) / <alpha-value>)',
        line:         'rgb(var(--line) / <alpha-value>)',
        accent:       'rgb(var(--accent) / <alpha-value>)',
        // Conservation des anciens tokens FT (compat pendant la migration)
        'ft-blue': '#0A76F6',
        'ft-darkblue': '#0053B3',
        'ft-lightblue': '#E8F1FA',
        'ft-gray': '#F2F2F7',
        'ft-darkgray': '#6A6A6A',
      },
      boxShadow: {
        glow: '0 0 20px -2px rgb(var(--accent) / 0.45)',
        'glow-violet': '0 0 24px -4px rgba(139, 92, 246, 0.55)',
        'glow-cyan': '0 0 24px -4px rgba(34, 211, 238, 0.5)',
        glass: '0 8px 32px -8px rgba(15, 8, 40, 0.35)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 55%, #22D3EE 100%)',
        'accent-gradient-soft': 'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(59,130,246,0.85))',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'float-glow': { '0%,100%': { opacity: 0.5 }, '50%': { opacity: 0.85 } },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'float-glow': 'float-glow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
