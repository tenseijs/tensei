const mix = require('laravel-mix')

mix
  .webpackConfig({
    externals: {
      react: 'window.React',
      '@tensei/components': 'window.Tensei.lib'
    }
  })
  .js('./client/index.js', 'build/public/app.js')
  .postCss('./client/app.css', 'build/public/app.css', [require('tailwindcss')])
  .react()
