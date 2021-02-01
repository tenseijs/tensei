#!/usr/bin/env node

import yargs from 'yargs'

yargs
    .commandDir('./commands')
    .scriptName('tensei')
    .example('yarn tensei g plugin', '"Generate a tensei plugin.\'/\'"')
    .demandCommand()
    .strict().argv
