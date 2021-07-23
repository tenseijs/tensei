#!/usr/bin/env node

import Fs from 'fs'
import Path from 'path'
import { program } from 'commander'
import { CommandContract, DataPayload } from '@tensei/common'

// Set cli env variable
process.env.TENSEI_MODE = 'cli'

// Require tensei application from src/index.js file, index.js file, app.js file or src/index.ts file, index.ts file, app.ts file.
// Or rather, require the package.json file from the project, then get the main key, and require that file.

const getAppRootPath = () => {
  const packageJson = require(Path.resolve(process.cwd(), 'package.json'))

  return packageJson.main
}

const appPath = Path.resolve(process.cwd(), getAppRootPath())

;(async () => {
  let tensei = await require(appPath)

  tensei.ctx.commands.forEach((command: CommandContract<any>) => {
    program
      .command(command.config.signature)
      .description(command.config.description)
      .action(async (...parameters) => {
        const thisCommand = parameters[parameters.length - 1]

        const parameterObject: DataPayload = {}

        thisCommand._args.forEach((arg: any, index: number) => {
          parameterObject[arg._name] = parameters[index]
        })

        await command.config.handler(parameterObject, tensei.ctx)

        if (tensei.ctx.orm.config.get('type') !== 'sqlite') {
          await tensei.shutdown()
        }

        process.exit(0)
      })
  })

  program.parse(process.argv)
})()
