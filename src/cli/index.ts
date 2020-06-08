#!/usr/bin/env node

import Consola from 'consola'
import Commander from 'commander'

import createAdmin from './actions/create-admin'

Commander.program
    .command('create:admin')
    .description('Create a flamingo administrator user.')
    .action(createAdmin)

Commander.program.parse(process.argv)
