const mix = require('laravel-mix')

mix.postCss('./src/docs/app.css', 'build/docs/app.css', [
    require('tailwindcss')
])
    .ts('./src/docs/app.tsx', 'build/docs/app.js')
    .react()
