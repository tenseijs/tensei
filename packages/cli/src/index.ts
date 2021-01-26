#!/usr/bin/env node

import yargs from 'yargs'

yargs
  .commandDir('./commands')
  .scriptName('tensei')
  .example(
    'yarn tensei build netlify',
    "\"Build the tensei application for a netlify deployment'/'\""
  )
  .demandCommand()
  .strict().argv
