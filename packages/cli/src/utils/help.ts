/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { logger } from '@poppinss/cliui'
import termSize from 'term-size'
import { sortAndGroupCommands } from './sortAndGroupCommands'
import {
  Aliases,
  CommandArg,
  CommandFlag,
  SerializedCommand
} from '@tensei/common'

/**
 * Converts a line to rows at a specific width
 */
function lineToRows(text: string, width: number) {
  const rows: string[] = []
  let row: string[] = []
  let wordsCount = 0

  text.split(' ').forEach(word => {
    if (wordsCount + (word.length + 1) > width) {
      /**
       * Push the number of whitespace left after the existing current
       * and the terminal space. We need to do this, coz we at times
       * have whitespace when the upcoming word may break into next
       * lines
       */
      row.push(new Array(width - wordsCount + 1).join(' '))

      /**
       * Push the existing row to the rows
       */
      rows.push(row.join(' '))

      /**
       * Row is empty now
       */
      row = []

      /**
       * Row has zero words
       */
      wordsCount = 0
    }

    /**
     * Increase the words count + 1. The extra one is for the
     * whitspace between the words
     */
    wordsCount += word.length + 1

    /**
     * Collect word inside the row
     */
    row.push(word)
  })

  /**
   * Handle the orphan row
   */
  if (row.length) {
    rows.push(row.join(' '))
  }

  return rows
}

/**
 * Converts the description to multiple lines fitting into
 * a given column size
 */
function descriptionToRows(
  description: string,
  options: {
    nameColumnSize: number
    descriptionColumnsSize: number
  }
): string {
  return lineToRows(description, options.descriptionColumnsSize)
    .map((column, index) => {
      return index > 0
        ? `${new Array(options.nameColumnSize + 1).join(' ')}${column}`
        : column
    })
    .join('')
}

/**
 * Wraps the command arg inside `<>` or `[]` brackets based upon if it's
 * required or not.
 */
function wrapArg(arg: CommandArg): string {
  const displayName = arg.type === 'spread' ? `...${arg.name}` : arg.name
  return arg.required ? `<${displayName}>` : `[${displayName}]`
}

/**
 * Returns an array of flags for displaying the help screen
 */
function getFlagsForDisplay(flags: CommandFlag[]) {
  return flags.map(({ name, type, alias, description }) => {
    /**
     * Display name is the way we want to display a single flag in the
     * list of flags
     */
    const displayName = alias ? `-${alias}, --${name}` : `--${name}`

    /**
     * The type hints the user about the expectation on the flag type. We only
     * print the type, when flag is not a boolean.
     */
    let displayType = ''
    switch (type) {
      case 'array':
        displayType = 'string[]'
        break
      case 'numArray':
        displayType = 'number[]'
        break
      case 'string':
        displayType = 'string'
        break
      case 'boolean':
        displayType = 'boolean'
        break
      case 'number':
        displayType = 'number'
        break
    }

    return {
      displayName,
      displayType,
      description,
      width: displayName.length + displayType.length
    }
  })
}

/**
 * Returns an array of args for displaying the help screen
 */
function getArgsForDisplay(args: CommandArg[]) {
  return args.map(({ name, description }) => {
    return {
      displayName: name,
      description: description,
      width: name.length
    }
  })
}

/**
 * Returns an array of commands for display
 */
function getCommandsForDisplay(
  commands: SerializedCommand[],
  aliases: Aliases
) {
  return commands.map(({ commandName, description }) => {
    const commandAliases = getCommandAliases(commandName, aliases)
    const aliasesString = commandAliases.length
      ? ` [${commandAliases.join(', ')}]`
      : ''
    return {
      displayName: `${commandName}${aliasesString}`,
      description,
      width: commandName.length + aliasesString.length
    }
  })
}

/**
 * Returns the aliases for a given command
 */
function getCommandAliases(commandName: string, aliases: Aliases) {
  return Object.keys(aliases).reduce<string[]>((commandAliases, alias) => {
    if (aliases[alias] === commandName) {
      commandAliases.push(alias)
    }
    return commandAliases
  }, [])
}

/**
 * Prints help for all the commands by sorting them in alphabetical order
 * and grouping them as per their namespace.
 */
export function printHelp(
  commands: SerializedCommand[],
  flags: CommandFlag[],
  aliases: Aliases
): void {
  const flagsList = getFlagsForDisplay(flags)
  const commandsList = getCommandsForDisplay(commands, aliases)

  /**
   * Get width of longest command name.
   */
  const maxWidth = Math.max.apply(
    Math,
    flagsList.concat(commandsList as any).map(({ width }) => width)
  )

  /**
   * Size of the terminal columns. Max width is the width of the command
   * name and the extra four is whitespace around the command name.
   *
   * This gives the columns size for the description section
   */
  const descriptionColumnsSize = termSize().columns - (maxWidth + 4)

  /**
   * Sort commands and group them, so that we can print them as per
   * the namespace they belongs to
   */
  sortAndGroupCommands(commands).forEach(
    ({ group, commands: groupCommands }) => {
      console.log('')

      if (group === 'root') {
        console.log(
          logger.colors.bold(logger.colors.yellow('Available commands'))
        )
      } else {
        console.log(logger.colors.bold(logger.colors.yellow(group)))
      }

      groupCommands.forEach(({ commandName, description }) => {
        const commandAliases = getCommandAliases(commandName, aliases)
        const aliasesString = commandAliases.length
          ? ` [${commandAliases.join(', ')}]`
          : ''
        const displayName = `${commandName}${aliasesString}`

        const whiteSpace = ''.padEnd(maxWidth - displayName.length, ' ')
        const descriptionRows = descriptionToRows(description, {
          nameColumnSize: maxWidth + 4,
          descriptionColumnsSize
        })

        console.log(
          `  ${logger.colors.green(
            displayName
          )} ${whiteSpace}  ${logger.colors.dim(descriptionRows)}`
        )
      })
    }
  )

  if (flagsList.length) {
    console.log('')
    console.log(logger.colors.bold(logger.colors.yellow('Global Flags')))

    flagsList.forEach(
      ({ displayName, displayType, description = '', width }) => {
        const whiteSpace = ''.padEnd(maxWidth - width, ' ')
        const descriptionRows = descriptionToRows(description, {
          nameColumnSize: maxWidth + 4,
          descriptionColumnsSize
        })

        console.log(
          `  ${logger.colors.green(displayName)} ${logger.colors.dim(
            displayType
          )}${whiteSpace}  ${logger.colors.dim(descriptionRows)}`
        )
      }
    )
  }
}

/**
 * Prints help for a single command
 */
export function printHelpFor(
  command: SerializedCommand,
  aliases: Aliases
): void {
  if (command.description) {
    console.log('')
    console.log(command.description)
  }

  console.log('')
  console.log(
    `${logger.colors.yellow('Usage:')} ${
      command.commandName
    } ${logger.colors.dim(command.args.map(wrapArg).join(' '))}`
  )

  const flags = getFlagsForDisplay(command.flags)
  const args = getArgsForDisplay(command.args)

  /**
   * Getting max width to keep flags and args symmetric
   */
  const maxWidth = Math.max.apply(
    Math,
    flags.concat(args as any).map(({ width }) => width)
  )

  /**
   * Size of the terminal columns. Max width is the width of the command
   * name and the extra four is whitespace around the command name.
   *
   * This gives the columns size for the description section
   */
  const descriptionColumnsSize = termSize().columns - (maxWidth + 5)

  const commandAliases = getCommandAliases(command.commandName, aliases)
  if (commandAliases.length) {
    console.log('')
    console.log(
      `${logger.colors.yellow('Aliases:')} ${logger.colors.green(
        commandAliases.join(', ')
      )}`
    )
  }

  if (args.length) {
    console.log('')
    console.log(logger.colors.bold(logger.colors.yellow('Arguments')))

    args.forEach(({ displayName, description = '', width }) => {
      const whiteSpace = ''.padEnd(maxWidth - width, ' ')
      const descriptionRow = descriptionToRows(description, {
        nameColumnSize: maxWidth + 5,
        descriptionColumnsSize
      })

      console.log(
        `  ${logger.colors.green(
          displayName
        )} ${whiteSpace}  ${logger.colors.dim(descriptionRow)}`
      )
    })
  }

  if (flags.length) {
    console.log('')
    console.log(logger.colors.bold(logger.colors.yellow('Flags')))

    flags.forEach(({ displayName, displayType, description = '', width }) => {
      const whiteSpace = ''.padEnd(maxWidth - width, ' ')
      const descriptionRow = descriptionToRows(description, {
        nameColumnSize: maxWidth + 5,
        descriptionColumnsSize
      })

      console.log(
        `  ${logger.colors.green(displayName)} ${logger.colors.dim(
          displayType
        )}${whiteSpace}  ${logger.colors.dim(descriptionRow)}`
      )
    })
  }
}
