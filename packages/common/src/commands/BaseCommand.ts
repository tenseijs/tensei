/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { snakeCase } from 'change-case'

import {
  CommandArg,
  CommandFlag,
  KernelContract,
  CommandSettings,
  CommandContract
} from '@tensei/common'

/**
 * Abstract base class other classes must extend
 */
export abstract class BaseCommand implements CommandContract {
  options = {
    async handler() {},
    async completed() {
      return false
    },
    async prepare() {}
  }

  public argValues = {}

  public flagValues = {}

  /**
   * Reference to the exit handler
   */
  protected exitHandler?: () => void | Promise<void>

  public kernel: KernelContract = {} as any

  /**
   * Command arguments
   */
  public args: CommandArg[] = []

  /**
   * Command aliases
   */
  public aliases: string[] = []

  /**
   * Command flags
   */
  public flags: CommandFlag[] = []

  /**
   * Command name. The command will be registered using this name only. Make
   * sure their aren't any spaces inside the command name.
   */
  public name: string = ''

  public commandName: string = ''

  /**
   * The description of the command displayed on the help screen.
   * A good command will always have some description.
   */
  public description: string = ''

  /**
   * Any settings a command wants to have. Helpful for third party
   * tools to read the settings in lifecycle hooks and make
   * certain decisions
   */
  public settings: CommandSettings = {
    loadApp: false,
    stayAlive: false,
    environment: 'dev'
  }

  public describe(description: string) {
    this.description = description

    return this
  }

  public stayAlive() {
    this.settings.stayAlive = true

    return this
  }

  public setName(name: string) {
    this.commandName = name
    this.name = name

    return this
  }

  public arg(arg: Omit<CommandArg, 'propertyName'>) {
    this.args.push({
      type: arg.type || 'string',
      propertyName: arg.name,
      name: arg.name,
      required: arg.required === false ? false : true
    })

    return this
  }

  public flag(flag: Omit<CommandFlag, 'propertyName'>) {
    this.flags.push({
      type: flag.type || 'string',
      propertyName: flag.name,
      name: flag.name || flag.name
    })

    return this
  }

  /**
   * Define an argument directly on the command without using the decorator
   */
  public $addArgument(options: Partial<CommandArg>) {
    if (!options.propertyName) {
      const { Exception } = require('@poppinss/utils')
      throw new Exception(
        '"propertyName" is required to register a command argument',
        500,
        'E_MISSING_ARGUMENT_NAME'
      )
    }

    const arg: CommandArg = Object.assign(
      {
        type: options.type || 'string',
        propertyName: options.propertyName,
        name: options.name || options.propertyName,
        required: options.required === false ? false : true
      },
      options
    )

    this.args.push(arg)
  }

  /**
   * Define a flag directly on the command without using the decorator
   */
  public $addFlag(options: Partial<CommandFlag>) {
    if (!options.propertyName) {
      const { Exception } = require('@poppinss/utils')
      throw new Exception(
        '"propertyName" is required to register command flag',
        500,
        'E_MISSING_FLAG_NAME'
      )
    }

    const flag: CommandFlag = Object.assign(
      {
        name:
          options.name || snakeCase(options.propertyName).replace(/_/g, '-'),
        propertyName: options.propertyName,
        type: options.type || 'boolean'
      },
      options
    )

    this.flags.push(flag)
  }

  /**
   * Reference to cli ui
   */
  public ui = (() => {
    const { instantiate } = require('@poppinss/cliui/build/api')

    return instantiate(process.env.NODE_ENV === 'test')
  })()

  /**
   * Parsed options on the command. They only exist when the command
   * is executed via kernel.
   */
  public parsed?: import('getopts').ParsedOptions

  /**
   * The prompt for the command
   */
  public prompt:
    | import('@poppinss/prompts').Prompt
    | import('@poppinss/prompts').FakePrompt = (() => {
    const { FakePrompt, Prompt } = require('@poppinss/prompts')
    return process.env.NODE_ENV === 'test' ? new FakePrompt() : new Prompt()
  })()

  /**
   * Returns the instance of logger to log messages
   */
  public logger = this.ui.logger

  /**
   * Reference to the colors
   */
  public colors: ReturnType<
    typeof import('@poppinss/cliui/build/api')['instantiate']
  >['logger']['colors'] = this.logger.colors

  /**
   * Error raised by the command
   */
  public error?: any

  /**
   * Command exit code
   */
  public exitCode?: number

  public run(callback: () => Promise<any>) {
    this.options.handler = callback.bind(this)

    return this
  }
  public prepare(callback: () => Promise<any>) {
    this.options.prepare = callback

    return this
  }

  public completed(callback: () => Promise<boolean>) {
    this.options.completed = callback

    return this
  }

  /**
   * Execute the command
   */
  public async exec() {
    const run = this.options.handler

    let commandResult: any

    /**
     * Run command and catch any raised exceptions
     */
    try {
      /**
       * Run prepare method when exists on the command instance
       */
      if (typeof this.options.prepare === 'function') {
        await this.options.prepare()
      }

      /**
       * Execute the command handle or run method
       */
      commandResult = await run() // Todo: Call command.
    } catch (error) {
      this.error = error
    }

    let errorHandled = false

    /**
     * Run completed method when exists
     */
    if (typeof this.options.completed === 'function') {
      errorHandled = await this.options.completed()
    }

    /**
     * Throw error when error exists and the completed method didn't
     * handled it
     */
    if (this.error && !errorHandled) {
      throw this.error
    }

    return commandResult
  }

  /**
   * Register an onExit handler
   */
  public onExit(handler: () => void | Promise<void>) {
    this.exitHandler = handler
    return this
  }

  /**
   * Trigger exit
   */
  public async exit() {
    if (typeof this.exitHandler === 'function') {
      await this.exitHandler()
    }

    await this.kernel.exit(this)
  }

  /**
   * Must be defined by the parent class
   */
  // @depreciated
  public async handle?(...args: any[]): Promise<any>
}
