module.exports = {
  corePlugins: {
    preflight: false, // This disables Tailwind's base styles
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}