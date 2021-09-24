/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CommandsGroup, SerializedCommand } from '@tensei/common'

/**
 * Loops over the commands and converts them to an array of sorted groups with
 * nested commands inside them. The grouping is done using the command
 * namespace seperated with `:`. Example: `make:controller`
 */
export function sortAndGroupCommands(
  commands: SerializedCommand[]
): CommandsGroup {
  /**
   * Create a group of commands using it's namespace
   */
  const groupsLiteral = commands.reduce((result, command) => {
    const tokens = command.commandName.split(':')

    /**
     * Use the command namespace or move it inside the `root` group when
     * it is not namespaced.
     */
    const group = tokens.length > 1 ? tokens.shift()! : 'root'

    result[group] = result[group] || []
    result[group].push(command)

    return result
  }, {} as { [key: string]: SerializedCommand[] })

  /**
   * Convert the object literal groups and it's command to an
   * array of sorted groups and commands
   */
  return Object.keys(groupsLiteral)
    .sort((prev, curr) => {
      if (prev === 'root') {
        return -1
      }

      if (curr === 'root') {
        return 1
      }

      if (curr > prev) {
        return -1
      }

      if (curr < prev) {
        return 1
      }

      return 0
    })
    .map(name => {
      return {
        group: name,
        commands: groupsLiteral[name].sort((prev, curr) => {
          if (curr.commandName > prev.commandName) {
            return -1
          }

          if (curr.commandName < prev.commandName) {
            return 1
          }

          return 0
        })
      }
    })
}
