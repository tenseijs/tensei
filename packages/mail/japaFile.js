process.env.TS_NODE_FILES = true
require('@adonisjs/require-ts/build/register')

const { configure } = require('japa')
configure({
  files: ['test/**/*.spec.ts']
})
