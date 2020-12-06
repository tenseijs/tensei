const Path = require('path')
const mix = require('laravel-mix')

mix.options({
    terser: {
        extractComments: false
    }
})

mix.ts('app.tsx', 'public/app.js')
    .postCss('css/app.css', 'public/app.css', [require('tailwindcss')])
    .copy('public/', Path.resolve('./', '..', 'core', 'build', 'public'))
