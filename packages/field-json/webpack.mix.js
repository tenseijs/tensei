const mix = require('laravel-mix')

mix
  .webpackConfig({
    externals: {
      react: 'window.React'
    }
  })
  .ts('client/index.tsx', 'build/public/app.js')
  .react()
