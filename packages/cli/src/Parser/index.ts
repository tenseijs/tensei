/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import getopts from 'getopts'

import {
  CommandArg,
  CommandFlag,
  GlobalFlagHandler,
  CommandConstructorContract
} from '@tensei/common'

import {
  InvalidFlagException,
  MissingArgumentException,
  UnknownFlagException
} from '../Exceptions'

/**
 * The job of the parser is to parse the command line values by taking
 * the command `args`, `flags` and `globalFlags` into account.
 */
export class Parser {
  constructor(
    private registeredFlags: {
      [name: string]: CommandFlag & { handler: GlobalFlagHandler }
    }
  ) {}

  /**
   * Validate all the flags against the flags registered by the command
   * or as global flags and disallow unknown flags.
   */
  private scanForUnknownFlags(
    parsed: getopts.ParsedOptions,
    flagsAndAliases: string[]
  ) {
    Object.keys(parsed).forEach(key => {
      if (key === '_') {
        return
      }

      const hasFlag = flagsAndAliases.find(value => value === key)
      if (!hasFlag) {
        throw UnknownFlagException.invoke(key)
      }
    })
  }

  /**
   * Processes ace command flag to set the options for `getopts`.
   * We just define the `alias` with getopts coz their default,
   * string and boolean options produces the behavior we don't
   * want.
   */
  private preProcessFlag(flag: CommandFlag, options: getopts.Options) {
    /**
     * Register alias (when exists)
     */
    if (flag.alias) {
      options.alias![flag.alias] = flag.name
    }
  }

  /**
   * Casts a flag value to a boolean. The casting logic is driven
   * by the behavior of "getopts"
   */
  private castToBoolean(value: any) {
    if (typeof value === 'boolean') {
      return value
    }

    if (value === 'true' || value === '=true') {
      return true
    }

    return undefined
  }

  /**
   * Cast the value to a string. The casting logic is driven
   * by the behavior of "getopts"
   *
   * - Convert numbers to string
   * - Do not convert boolean to a string, since a flag without a value
   *   gets a boolean value, which is invalid
   */
  private castToString(value: any) {
    if (typeof value === 'number') {
      value = String(value)
    }

    if (typeof value === 'string' && value.trim()) {
      return value
    }

    return undefined
  }

  /**
   * Cast value to an array of string. The casting logic is driven
   * by the behavior of "getopts"
   *
   * - Numeric values are converted to string of array
   * - A string value is splitted by comma and trimmed.
   * - An array is casted to an array of string values
   */
  private castToArray(value: any) {
    if (typeof value === 'number') {
      value = String(value)
    }

    if (typeof value === 'string') {
      return value.split(',').filter(prop => prop.trim())
    }

    if (Array.isArray(value)) {
      /**
       * This will also convert numeric values to a string. The behavior
       * is same as string flag type.
       */
      return value.map(prop => String(prop))
    }

    return undefined
  }

  /**
   * Cast value to an array of numbers. The casting logic is driven
   * by the behavior of "getopts".
   *
   * - Numeric values are wrapped to an array.
   * - String is splitted by comma and each value is casted to a number
   * - Each array value is casted to a number.
   */
  private castToNumArray(value: any) {
    if (typeof value === 'number') {
      return [value]
    }

    if (typeof value === 'string') {
      return value.split(',').map(one => Number(one))
    }

    if (Array.isArray(value)) {
      return value.map(prop => Number(prop))
    }

    return undefined
  }

  /**
   * Cast value to a number. The casting logic is driven
   * by the behavior of "getopts"
   *
   * - Boolean values are not allowed
   * - A string is converted to a number
   */
  private castToNumer(value: any): number | undefined {
    if (typeof value === 'number') {
      return value
    }

    if (typeof value === 'string') {
      // Possibility of NaN here
      return Number(value)
    }

    return undefined
  }

  /**
   * Casts value of a flag to it's expected data type. These values
   * are then later validated to ensure that casting was successful.
   */
  public processFlag(
    flag: CommandFlag,
    parsed: getopts.ParsedOptions,
    command?: CommandConstructorContract
  ) {
    let value = parsed[flag.name]

    /**
     * Check for the value with the alias, if it undefined
     * by the name
     */
    if (value === undefined && flag.alias) {
      value = parsed[flag.alias]
    }

    /**
     * Still undefined??
     *
     * It is fine. Flags are optional anyways
     */
    if (value === undefined) {
      return
    }

    /**
     * Handle boolean values. It should be a valid boolean
     * data type or a string value of `'true'`.
     */
    if (flag.type === 'boolean') {
      value = this.castToBoolean(value)
      if (value === undefined) {
        throw InvalidFlagException.invoke(flag.name, flag.type, command)
      }
    }

    /**
     * Handle string value. It should be a valid and not empty.
     * Either remove the flag or provide a value
     */
    if (flag.type === 'string') {
      value = this.castToString(value)
      if (value === undefined) {
        throw InvalidFlagException.invoke(flag.name, flag.type, command)
      }
    }

    /**
     * Handle numeric values. The flag should have a value and
     * a valid number.
     */
    if (flag.type === 'number') {
      value = this.castToNumer(value)
      if (value === undefined || isNaN(value)) {
        throw InvalidFlagException.invoke(flag.name, flag.type, command)
      }
    }

    /**
     * Parse the value to be an array of strings
     */
    if (flag.type === 'array') {
      value = this.castToArray(value)
      if (!value || !value.length) {
        throw InvalidFlagException.invoke(flag.name, flag.type, command)
      }
    }

    /**
     * Parse the value to be an array of numbers
     */
    if (flag.type === 'numArray') {
      value = this.castToNumArray(value)
      if (!value || !value.length) {
        throw InvalidFlagException.invoke(flag.name, flag.type, command)
      }

      /**
       * Find if array has NaN values
       */
      if (value.findIndex((one: any) => isNaN(one)) > -1) {
        throw InvalidFlagException.invoke(flag.name, flag.type, command)
      }
    }

    parsed[flag.name] = value
    if (flag.alias) {
      parsed[flag.alias] = value
    }
  }

  /**
   * Validates the value to ensure that values are defined for
   * required arguments.
   */
  public validateArg(
    arg: CommandArg,
    index: number,
    parsed: getopts.ParsedOptions,
    command: CommandConstructorContract
  ) {
    const value = parsed._[index]

    if (value === undefined && arg.required) {
      throw MissingArgumentException.invoke(arg.name, command)
    }
  }

  /**
   * Parses argv and executes the command and global flags handlers
   */
  public parse(
    argv: string[],
    command?: CommandConstructorContract
  ): getopts.ParsedOptions {
    let options = { alias: {}, boolean: [], default: {}, string: [] }
    const flagsAndAliases: string[] = []

    const globalFlags = Object.keys(this.registeredFlags).map(
      name => this.registeredFlags[name]
    )

    /**
     * Build options from global flags
     */
    globalFlags.forEach(flag => {
      this.preProcessFlag(flag, options)
      flagsAndAliases.push(flag.name)
      flag.alias && flagsAndAliases.push(flag.alias)
    })

    /**
     * Build options from command flags
     */
    if (command) {
      command.flags.forEach(flag => {
        this.preProcessFlag(flag, options)
        flagsAndAliases.push(flag.name)
        flag.alias && flagsAndAliases.push(flag.alias)
      })
    }

    /**
     * Parsing argv with the previously built options
     */
    const parsed = getopts(argv, options)

    /**
     * Scan and report unknown flag as exception
     */
    this.scanForUnknownFlags(parsed, flagsAndAliases)

    /**
     * Validating global flags (if any)
     */
    globalFlags.forEach(flag => {
      this.processFlag(flag, parsed)
    })

    /**
     * Validating command flags (if command is defined)
     */
    if (command) {
      command.flags.forEach(flag => {
        this.processFlag(flag, parsed)
      })
    }

    return parsed
  }
}
