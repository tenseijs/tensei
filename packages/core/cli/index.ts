#!/usr/bin/env node

import Consola from 'consola'
import Commander from 'commander'

// import createAdmin from './actions/create-admin'

Commander.program
  .command('create:admin')
  .description('Create a tensei administrator user.')
  .action(console.log)

Commander.program.parse(process.argv)
