module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['src/client/**/*.js'],
  },
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
}
