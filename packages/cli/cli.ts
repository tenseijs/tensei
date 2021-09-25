#!/usr/bin/env node

import { register } from '@adonisjs/require-ts'
import {
  Kernel,
  handleError,
  serve,
  app,
  getProjectDirectory,
  build
} from './src'

// Set cli env variable
process.env.TENSEI_MODE = 'cli'
;(async () => {
  // Register ts hook
  register(getProjectDirectory(), {
    cache: true
  })

  let tensei = await app()

  const { commands } = tensei.ctx

  const kernel = new Kernel(tensei)

  kernel.register([serve, build, ...commands])

  kernel.flag(
    'help',
    (value, _, command) => {
      if (!value) {
        return
      }

      kernel.printHelp(command)
      process.exit(0)
    },
    { type: 'boolean' }
  )

  kernel.onExit(() => {
    if (kernel.error) {
      handleError(kernel.error)
    }
    process.exit(kernel.exitCode)
  })

  kernel.handle(process.argv.splice(2))
})()
