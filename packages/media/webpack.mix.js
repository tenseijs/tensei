const mix = require('laravel-mix')

mix.webpackConfig({
    externals: {
        react: 'window.React',
        '@tensei/components': 'window.Tensei.lib'
    }
})
    .js('./client/index.js', 'build/public/app.js')
    .react()
