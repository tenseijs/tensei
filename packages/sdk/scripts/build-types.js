const Fs = require('fs')
const Path = require('path')

Fs.writeFileSync(
  Path.resolve(__dirname, '..', 'build/index.d.ts'),
  `
declare module '@tensei/sdk'
`
)
