#!/usr/bin/env node
'use strict'

import { cli } from './cli'
import { Command } from 'commander'
import Signale from './utils/signale'
const packageJson = require('../package.json')

const program = new Command(packageJson.name)

program
    .version(packageJson.version)
    .arguments('<directory>')
    .option('--template <template>', 'Specify a supported template')
    .option('--rest', 'Bootstrap a rest API project')
    .option('--database <database>', 'Specify the database to setup')
    .option('--dbname <dbname>', 'Database name')
    .option('--dbhost <dbhost>', 'Database host')
    .option('--dbusername <dbusername>', 'Database username')
    .option('--dbpassword <dbpassword>', 'Database password')
    .option('--no-run', 'Do not start the application after it is created')
    .option('--npm', 'Use npm package manager in place of yarn')
    .description('Scaffold a new tensei application')
    .parse(process.argv)

if (!program.args[0]) {
    Signale.error('Please specify a valid project name.')

    process.exit(1)
}

cli(program as any)
