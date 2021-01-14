const Path = require('path')
const mix = require('laravel-mix')

mix.options({
    terser: {
        extractComments: false
    }
})

mix.extract(['react', 'react-dom', 'react-router-dom'])
    .ts('main.tsx', 'build/public/')
    .postCss('css/styles.css', 'build/public/', [require('tailwindcss')])
// .copy('plugin/template/index.mustache', 'build/template/index.mustache')
