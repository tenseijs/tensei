/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'
import { CommandConstructorContract, CommandArg } from '@tensei/common'

/**
 * Validates the command static properties to ensure that all the
 * values are correctly defined for a command to be executed.
 */
export function validateCommand(
  command: any,
  commandPath?: string
): asserts command is CommandConstructorContract {
  if (!command.name) {
    throw new Exception(
      `Invalid command"${
        commandPath ? ` ${commandPath}` : ''
      }". Make sure the command is exported using the "export default"`
    )
  }

  /**
   * Ensure command has a name, a boot method and args property
   */
  if (!command.commandName) {
    throw new Exception(`Invalid command "${command.name}".`)
  }

  /**
   * Ensure command has args and flags after the boot method
   */
  if (!Array.isArray(command.args) || !Array.isArray(command.flags)) {
    throw new Exception(
      `Invalid command "${command.name}". Make sure to define valid args and flags.`
    )
  }

  let optionalArg: CommandArg

  /**
   * Validate for optional args and spread args
   */
  command.args.forEach((arg: CommandArg, index: number) => {
    /**
     * Ensure optional arguments comes after required
     * arguments
     */
    if (optionalArg && arg.required) {
      throw new Exception(
        `Optional argument "${optionalArg.name}" must be after the required argument "${arg.name}"`
      )
    }

    /**
     * Ensure spread arg is the last arg
     */
    if (arg.type === 'spread' && command.args.length > index + 1) {
      throw new Exception(
        `Spread argument "${arg.name}" must be at last position`
      )
    }

    if (!arg.required) {
      optionalArg = arg
    }
  })
}
