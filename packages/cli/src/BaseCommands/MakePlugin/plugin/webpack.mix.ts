import { FileContent } from '../types'

export function webpackMix(): FileContent {
  return {
    content: `
const mix = require('laravel-mix')

mix
  .webpackConfig({
    externals: {
      react: 'window.React'
    }
  })
  .ts('client/index.tsx', 'build/public/app.js')
  .react()`,
    location: 'webpack.mix.js',
    sides: ['frontend']
  }
}
