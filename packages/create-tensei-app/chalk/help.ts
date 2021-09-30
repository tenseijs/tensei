/*
 * create-adonis-ts-app
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { logger } from '@adonisjs/sink'

/**
 * Text to show on the help screen. Its simple and hence writing it
 * by hand is fine
 */
export const getHelp = (yarn: boolean) => `${logger.colors.green(
  yarn ? 'yarn create tensei-app' : 'npm init tensei-app'
)} ${logger.colors.dim('<project-name>')}

${logger.colors.yellow().bold('Options')}
${logger.colors.green('--boilerplate')} ${logger.colors.dim(
  '[graphql, rest]'
)}    ${logger.colors.dim('Select the project boilerplate')}
${logger.colors.green('--name')} ${logger.colors.dim(
  '<string>'
)}                   ${logger.colors.dim('Specify application name')}
${logger.colors.green('--debug')} ${logger.colors.dim(
  '<boolean>'
)}                 ${logger.colors.dim('Turn on the debug mode')}`
