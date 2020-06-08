const mix = require('laravel-mix')

require('laravel-mix-bundle-analyzer')

if (!mix.inProduction()) {
    mix.bundleAnalyzer()
}

mix.react(
    'src/client/index.js',
    'build/client/'
).postCss('src/client/index.css', 'build/client/', [require('tailwindcss')])
