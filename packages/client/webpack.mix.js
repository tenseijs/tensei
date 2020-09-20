const Path = require('path')
const mix = require('laravel-mix')

// require('laravel-mix-bundle-analyzer')

if (!mix.inProduction()) {
    // mix.bundleAnalyzer()
}

mix.options({
    terser: {
        extractComments: false,
    },
})

mix
    .setPublicPath('../core/build/client')
    .react('index.js', 'index.js')
    .postCss('css/index.css', 'index.css', [require('tailwindcss')])
