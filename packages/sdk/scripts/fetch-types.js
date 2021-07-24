#!/usr/bin/env node

const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')
const Consola = require('consola')

const command = process.argv[2]
let url = process.argv[3] || 'http://localhost:8810'

if (!['generate', 'g'].includes(command)) {
  Consola.error('You must provide a command such as `generate`.')

  process.exit(1)
}

Axios.get(`${url}/sdk/types`)
  .then(({ data }) => {
    Fs.writeFileSync(Path.resolve(__dirname, '..', 'build', 'index.d.ts'), data)
  })
  .catch(error => {
    Consola.error('Error fetching types:.', error.message)
  })
