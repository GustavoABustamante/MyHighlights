module.exports = {
  content: ["./src/**/*.{html,ts}"],
  safelist: ["bg-blue-400", "bg-green-400", "bg-red-400"],
  theme: {
    extend: {
      minHeight: {
        182: "48rem",
        '3/4': '75%',
        '90vh': '90vh',
      },
      height: {
        '90vh': '90vh',
      }
    },
  },
  plugins: [],
};
