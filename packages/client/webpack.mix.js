const Path = require('path')
const mix = require('laravel-mix')

require('laravel-mix-bundle-analyzer')

if (!mix.inProduction()) {
    mix.bundleAnalyzer()
}

mix.options({
  terser: {
    extractComments: false,
  }
})

mix.react(
    'index.js',
    './../server/build/index.client.js'
)

.postCss('index.css', './../server/build/index.min.css', [require('tailwindcss')])
