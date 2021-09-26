/*
 * create-adonis-ts-app
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { logger as sinkLogger, files } from '@adonisjs/sink'

/**
 * Shape of task functions
 */
export type TaskFn = (
  application: any,
  logger: typeof sinkLogger,
  state: CliState
) => void | Promise<void>

/**
 * CLI state
 */
export type CliState = {
  baseName: string
  absPath: string
  debug: boolean
  client: 'yarn' | 'npm'
  boilerplate: 'graphql' | 'rest'
  projectName: string
  eslint: boolean
  prettier: boolean
  encore: boolean
  pkg: files.PackageJsonFile
}
