module.exports = {
  content: ["./src/**/*.{html,ts}"],
  safelist: ["bg-neutral-800", "bg-green-800", "bg-red-800"],
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
