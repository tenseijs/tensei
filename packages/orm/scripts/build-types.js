#!/usr/bin/env node

const Fs = require('fs')
const Path = require('path')

const command = process.argv[2]

if (!['generate', 'g'].includes(command)) {
  console.error(`
You must provide a command such as 'generate'.	
`)

  process.exit(1)
}
