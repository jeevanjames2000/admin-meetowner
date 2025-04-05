/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // Adjust based on your project structure
    ],
    theme: {
      extend: {
        colors: {
          "custom-blue": {
            DEFAULT: "#1D3A76", // Default button color
            600: "#1D3A76",    // Active/selected state
            700: "#162A5B",    // Hover state (darker shade)
          },
        },
      },
    },
    plugins: [],
  };