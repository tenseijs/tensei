---
to: <%= h.changeCase.param(name) %>/webpack.mix.js
---
const mix = require('laravel-mix')

mix.webpackConfig({
    externals: {
        react: 'window.React',
        '@tensei/components': 'window.Tensei.lib'
    }
})
    .postCss('./client/app.css', 'build/client/app.css', [require('tailwindcss')])
    .ts('./client/app.tsx', 'build/client/app.js')
