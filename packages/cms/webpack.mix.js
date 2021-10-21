const path = require('path')
const mix = require('laravel-mix')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//   .BundleAnalyzerPlugin

mix.options({
  terser: {
    extractComments: false
  }
})

mix
  .alias({
    '@pages': path.join(__dirname, 'pages'),
    '@components': path.join(__dirname, 'pages/components')
  })
  .extract(['react', 'react-dom', 'react-router-dom'])
  .ts('main.tsx', 'build/public/')
  .webpackConfig({
    // plugins: [new BundleAnalyzerPlugin()]
  })
