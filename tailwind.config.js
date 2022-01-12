module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './public/**/*.{html,js}'],
  media: false,
  important: true,
  theme: {
    extend: {
      maxWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      }
    }
    ,
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
