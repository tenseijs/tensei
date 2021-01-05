const Path = require('path')
const mix = require('laravel-mix')

mix.options({
    terser: {
        extractComments: false
    }
})

mix.extract(['react', 'react-dom', 'react-router-dom'])
    .ts('main.tsx', 'public/')
    .postCss('css/styles.css', 'public/', [require('tailwindcss')])
    .copy('public/', Path.resolve('./', '..', 'core', 'build', 'public'))
