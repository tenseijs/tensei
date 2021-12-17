import hasYarn from 'has-yarn'
import { command } from '@tensei/common'
import { getProjectDirectory } from '../utils/get-app'

import { Compiler } from './Compiler/Compiler'

export const build = command('build')
  .flag({
    name: 'production',
    alias: 'prod',
    description: 'Build for production',
    type: 'boolean'
  })
  .flag({
    name: 'ignoreTsErrors',
    description: 'Ignore typescript errors and complete the build process.',
    type: 'boolean'
  })
  .flag({
    name: 'client',
    description: 'Select a package manager (npm or yarn).',
    type: 'string'
  })
  .describe('Compile project from Typescript to Javascript.')
  .run(async function () {
    const appRoot = getProjectDirectory()

    const client = this.flagValues.client || hasYarn(appRoot) ? 'yarn' : 'npm'

    if (client !== 'npm' && client !== 'yarn') {
      this.logger.warning('--client must be set to "npm" or "yarn"')
      this.exitCode = 1
      return
    }

    const stopOnError = !this.flagValues.ignoreTsErrors

    try {
      const compiler = new Compiler(appRoot, this.logger, 'tsconfig.json')

      const compiled = this.flagValues.production
        ? await compiler.compileForProduction(stopOnError, client)
        : await compiler.compile(stopOnError)

      /**
       * Set exitCode based upon the compiled status
       */
      if (!compiled) {
        this.exitCode = 1
      }
    } catch (error: any) {
      this.logger.fatal(error)
      this.exitCode = 1
    }
  })
