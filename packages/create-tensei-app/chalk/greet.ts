/*
 * create-adonis-ts-app
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { instructions, logger } from '@adonisjs/sink'
import { CliState } from '../contracts'

/**
 * Greet post creation
 */
export const greet = ({ baseName, client }: CliState) => {
  console.log('')

  const npxOrYarn = client === 'npm' ? 'npx' : 'yarn'

  instructions()
    .heading(logger.colors.dim('Run following commands to get started'))
    .add(logger.colors.cyan(`cd ${baseName}`))
    .add(logger.colors.cyan(`${npxOrYarn} tensei serve --watch`))
    .render()

  console.log('')
}
