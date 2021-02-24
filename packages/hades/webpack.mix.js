const mix = require('laravel-mix')

mix.postCss('./client/app.css', 'build/client/app.css', [
    require('tailwindcss')
]).ts('./client/app.tsx', 'build/client/app.js')
