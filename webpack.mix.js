const mix = require('laravel-mix')

mix
  .react('src/client/index.js', 'build/client/')
  .postCss('src/client/index.css', 'build/client/')
