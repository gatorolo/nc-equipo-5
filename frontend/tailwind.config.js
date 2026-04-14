/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'sagrada-bg': 'var(--sagrada-bg)',
        'sagrada-paper': 'var(--sagrada-paper)',
        'sagrada-purple': 'var(--sagrada-purple)',
        'sagrada-purple-dark': 'var(--sagrada-purple-dark)',
        'sagrada-gold': 'var(--sagrada-gold)',
        'sagrada-gold-hover': 'var(--sagrada-gold-hover)',
      }
    },
  },
  plugins: [],
  safelist: [
    'bg-blue-600',
    'bg-amber-500',
    'bg-purple-600',
    'bg-emerald-600',
    'bg-rose-500',
    'bg-slate-500',
    'from-blue-500', 'to-blue-600',
    'from-emerald-500', 'to-emerald-600',
    'from-purple-500', 'to-purple-600',
    'from-amber-500', 'to-amber-600'
  ]
}
