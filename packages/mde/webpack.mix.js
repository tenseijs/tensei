const mix = require('laravel-mix')

mix
  .webpackConfig({
    externals: {
      react: 'window.React'
    }
  })
  .ts('./src/components/Mde.tsx', 'build/client/app.js')
