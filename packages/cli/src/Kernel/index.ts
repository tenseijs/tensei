/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Hooks } from '../Hooks'
import { Parser } from '../Parser'
import { help } from '../BaseCommands/Help'
import { InvalidCommandException } from '../Exceptions'
import { printHelp, printHelpFor } from '../utils/help'
import { validateCommand } from '../utils/validateCommand'

// Use the command contract from tensei instead.
import { CommandContract } from '@tensei/common'

import {
  CommandFlag,
  KernelContract,
  TenseiContract,
  RunHookCallback,
  FindHookCallback,
  GlobalFlagHandler,
  CommandConstructorContract
} from '@tensei/common'
import { logger } from '@poppinss/cliui'

/**
 * Ace kernel class is used to register, find and invoke commands by
 * parsing `process.argv.splice(2)` value.
 */
export class Kernel implements KernelContract {
  /**
   * Reference to hooks class to execute lifecycle
   * hooks
   */
  private hooks = new Hooks()

  /**
   * The command that started the process
   */
  private entryCommand?: CommandContract

  /**
   * The state of the kernel
   */
  private state: 'idle' | 'running' | 'completed' = 'idle'

  public constructor(public application: TenseiContract) {}

  /**
   * Exit handler for gracefully exiting the process
   */
  private exitHandler: (callback: this) => void | Promise<void> = kernel => {
    if (kernel.error && typeof kernel.error.handle === 'function') {
      kernel.error.handle(kernel.error)
    } else if (kernel.error) {
      logger.fatal(kernel.error)
    }

    process.exit(kernel.exitCode === undefined ? 0 : kernel.exitCode)
  }

  /**
   * The default command that will be invoked when no command is
   * defined
   */
  public defaultCommand: CommandConstructorContract = help

  /**
   * List of registered commands
   */
  public commands: { [name: string]: CommandConstructorContract } = {}
  public aliases: { [alias: string]: string } = {}

  /**
   * List of registered flags
   */
  public flags: {
    [name: string]: CommandFlag & { handler: GlobalFlagHandler }
  } = {}

  /**
   * The exit code for the process
   */
  public exitCode?: number

  /**
   * The error collected as part of the running commands or executing
   * flags
   */
  public error?: any

  /**
   * Executing global flag handlers. The global flag handlers are
   * not async as of now, but later we can look into making them
   * async.
   */
  private executeGlobalFlagsHandlers(
    argv: string[],
    command?: CommandConstructorContract
  ) {
    const globalFlags = Object.keys(this.flags)
    const parsedOptions = new Parser(this.flags).parse(argv, command)

    globalFlags.forEach(name => {
      const value = parsedOptions[name]

      /**
       * Flag was not specified
       */
      if (value === undefined) {
        return
      }

      /**
       * Calling the handler
       */
      this.flags[name].handler(parsedOptions[name], parsedOptions, command)
    })
  }

  /**
   * Returns an array of all registered commands
   */
  private getAllCommandsAndAliases() {
    let commands: CommandConstructorContract[] = Object.keys(this.commands).map(
      name => this.commands[name]
    )

    let aliases = {}

    return {
      commands,
      aliases: Object.assign(aliases, this.aliases)
    }
  }

  /**
   * Processes the args and sets values on the command instance
   */
  private async processCommandArgsAndFlags(
    commandInstance: CommandContract,
    args: string[]
  ) {
    const parser = new Parser(this.flags)
    const command = commandInstance

    /**
     * Parse the command arguments. The `parse` method will raise exception if flag
     * or arg is not
     */

    const parsedOptions = parser.parse(args, command)

    /**
     * We validate the command arguments after the global flags have been
     * executed. It is required, since flags may have nothing to do
     * with the validaty of command itself
     */
    command.args.forEach((arg, index) => {
      parser.validateArg(arg, index, parsedOptions, command)
    })

    /**
     * Creating a new command instance and setting
     * parsed options on it.
     */
    commandInstance.parsed = parsedOptions

    /**
     * Setup command instance argument and flag
     * properties.
     */
    for (let i = 0; i < command.args.length; i++) {
      const arg = command.args[i]
      if (arg.type === 'spread') {
        ;(commandInstance as any)[arg.propertyName] = parsedOptions._.slice(i)
        break
      } else {
        ;(commandInstance as any)[arg.propertyName] = parsedOptions._[i]
      }
    }

    /**
     * Set flag value on the command instance
     */
    for (let flag of command.flags) {
      const flagValue = parsedOptions[flag.name]
      if (flagValue !== undefined) {
        ;(commandInstance as any)[flag.propertyName] = flagValue
      }
    }
  }

  /**
   * Execute the main command. For calling commands within commands,
   * one must call "kernel.exec".
   */
  private async execMain(commandName: string, args: string[]) {
    const command = await this.find([commandName])

    /**
     * Command not found. So execute global flags handlers and
     * raise an exception
     */
    if (!command) {
      this.executeGlobalFlagsHandlers(args)
      throw InvalidCommandException.invoke(
        commandName,
        this.getSuggestions(commandName)
      )
    }

    /**
     * Make an instance of the command
     */
    const commandInstance = command

    /**
     * Execute global flags
     */
    this.executeGlobalFlagsHandlers(args, command)

    /**
     * Process the arguments and flags for the command
     */
    await this.processCommandArgsAndFlags(commandInstance, args)

    /**
     * Keep a reference to the entry command. So that we know if we
     * want to entertain `.exit` or not
     */
    this.entryCommand = commandInstance

    /**
     * Execute before run hooks
     */
    await this.hooks.execute('before', 'run', commandInstance)

    /**
     * Execute command
     */
    return commandInstance.exec()
  }

  /**
   * Handles exiting the process
   */
  private async exitProcess(error?: any) {
    /**
     * Check for state to avoid exiting the process multiple times
     */
    if (this.state === 'completed') {
      return
    }

    this.state = 'completed'

    /**
     * Re-assign error if entry command exists and has error
     */
    if (!error && this.entryCommand && this.entryCommand.error) {
      error = this.entryCommand.error
    }

    /**
     * Execute the after run hooks. Wrapping inside try/catch since this is the
     * cleanup handler for the process and must handle all exceptions
     */
    try {
      if (this.entryCommand) {
        await this.hooks.execute('after', 'run', this.entryCommand)
      }
    } catch (hookError) {
      error = hookError
    }

    /**
     * Assign error to the kernel instance
     */
    if (error) {
      this.error = error
    }

    /**
     * Figure out the exit code for the process
     */
    const exitCode = error ? 1 : 0
    const commandExitCode = this.entryCommand && this.entryCommand.exitCode

    this.exitCode = commandExitCode === undefined ? exitCode : commandExitCode

    try {
      await this.exitHandler(this)
    } catch (exitHandlerError) {
      logger.warning(
        'Expected exit handler to exit the process. Instead it raised an exception'
      )
      logger.fatal(exitHandlerError)
    }
  }

  /**
   * Register a before hook
   */
  public before(action: 'run', callback: RunHookCallback): this
  public before(action: 'find', callback: FindHookCallback): this
  public before(
    action: 'run' | 'find',
    callback: RunHookCallback | FindHookCallback
  ): this {
    this.hooks.add('before', action, callback)
    return this
  }

  /**
   * Register an after hook
   */
  public after(action: 'run', callback: RunHookCallback): this
  public after(action: 'find', callback: FindHookCallback): this
  public after(
    action: 'run' | 'find',
    callback: RunHookCallback | FindHookCallback
  ): this {
    this.hooks.add('after', action, callback)
    return this
  }

  /**
   * Register an array of command constructors
   */
  public register(commands: CommandConstructorContract[]): this {
    commands.forEach(command => {
      validateCommand(command)

      // Set the kernel on all commands.
      command.kernel = this

      this.commands[command.commandName] = command

      /**
       * Registering command aliaes
       */
      command.aliases.forEach(
        alias => (this.aliases[alias] = command.commandName)
      )
    })

    return this
  }

  /**
   * Register a global flag. It can be defined in combination with
   * any command.
   */
  public flag(
    name: string,
    handler: GlobalFlagHandler,
    options: Partial<Exclude<CommandFlag, 'name' | 'propertyName'>>
  ): this {
    this.flags[name] = Object.assign(
      {
        name,
        propertyName: name,
        handler,
        type: 'boolean'
      },
      options
    )

    return this
  }

  /**
   * Register an exit handler
   */
  public onExit(callback: (kernel: this) => void | Promise<void>): this {
    this.exitHandler = callback
    return this
  }

  /**
   * Returns an array of command names suggestions for a given name.
   */
  public getSuggestions(name: string, distance = 3): string[] {
    const leven = require('leven')
    const { commands, aliases } = this.getAllCommandsAndAliases()

    const suggestions = commands
      .filter(({ commandName }) => leven(name, commandName) <= distance)
      .map(({ commandName }) => commandName)

    return suggestions.concat(
      Object.keys(aliases).filter(alias => leven(name, alias) <= distance)
    )
  }

  /**
   * Finds the command from the command line argv array. If command for
   * the given name doesn't exists, then it will return `null`.
   *
   * Does executes the before and after hooks regardless of whether the
   * command has been found or not
   */
  public async find(
    argv: string[]
  ): Promise<CommandConstructorContract | null> {
    /**
     * ----------------------------------------------------------------------------
     * Even though in `Unix` the command name may appear in between or at last, with
     * ace we always want the command name to be the first argument. However, the
     * arguments to the command itself can appear in any sequence. For example:
     *
     * Works
     *    - node ace make:controller foo
     *    - node ace make:controller --http foo
     *
     * Doesn't work
     *    - node ace foo make:controller
     * ----------------------------------------------------------------------------
     */
    const [commandName] = argv

    /**
     * Command name from the registered aliases
     */
    const aliasCommandName = this.aliases[commandName]

    /**
     * Try to find command inside manually registered command or fallback
     * to null
     */
    const command =
      this.commands[commandName] || this.commands[aliasCommandName] || null

    /**
     * Executing before and after together to be compatible
     * with the manifest find before and after hooks
     */
    await this.hooks.execute('before', 'find', command)
    await this.hooks.execute('after', 'find', command)

    return command
  }

  /**
   * Run the default command. The default command doesn't accept
   * and args or flags.
   */
  public async runDefaultCommand() {
    validateCommand(this.defaultCommand)

    // Set the kernel on defualt command.
    this.defaultCommand.kernel = this

    /**
     * Execute before/after find hooks
     */
    await this.hooks.execute('before', 'find', this.defaultCommand)
    await this.hooks.execute('after', 'find', this.defaultCommand)

    /**
     * Make the command instance using the container
     */
    const commandInstance = this.defaultCommand

    /**
     * Execute before run hook
     */
    await this.hooks.execute('before', 'run', commandInstance)

    /**
     * Keep a reference to the entry command
     */
    this.entryCommand = commandInstance

    /**
     * Execute the command
     */
    return commandInstance.exec()
  }

  /**
   * Execute a command as a sub-command. Do not call "handle" and
   * always use this method to invoke command programatically
   */
  public async exec(commandName: string, args: string[]) {
    const command = await this.find([commandName])

    /**
     * Command not found. So execute global flags handlers and
     * raise an exception
     */
    if (!command) {
      throw InvalidCommandException.invoke(
        commandName,
        this.getSuggestions(commandName)
      )
    }

    /**
     * Make an instance of command and keep a reference of it as `this.entryCommand`
     */
    const commandInstance = command

    /**
     * Process args and flags for the command
     */
    await this.processCommandArgsAndFlags(commandInstance, args)

    let commandError: any
    let commandResponse: any

    /**
     * Wrapping the command execution inside a try/catch, so that
     * we can run the after hooks regardless of success or
     * failure
     */
    try {
      await this.hooks.execute('before', 'run', commandInstance)
      commandResponse = await commandInstance.exec()
    } catch (error) {
      commandError = error
    }

    /**
     * Execute after hooks
     */
    await this.hooks.execute('after', 'run', commandInstance)

    /**
     * Re-throw error (if any)
     */
    if (commandError) {
      throw commandError
    }

    return commandResponse
  }

  /**
   * Makes instance of a given command by processing command line arguments
   * and setting them on the command instance
   */
  public async handle(argv: string[]) {
    if (this.state !== 'idle') {
      return
    }

    this.state = 'running'

    try {
      /**
       * Branch 1
       * Run default command and invoke the exit handler
       */
      if (!argv.length) {
        await this.runDefaultCommand()
        await this.exitProcess()
        return
      }

      /**
       * Branch 2
       * No command has been mentioned and hence execute all the global flags
       * invoke the exit handler
       */
      const hasMentionedCommand = !argv[0].startsWith('-')
      if (!hasMentionedCommand) {
        this.executeGlobalFlagsHandlers(argv)
        await this.exitProcess()
        return
      }

      /**
       * Branch 3
       * Execute the given command as the main command
       */
      const [commandName, ...args] = argv
      await this.execMain(commandName, args)

      /**
       * Exit the process if there isn't any entry command
       */
      if (!this.entryCommand) {
        await this.exitProcess()
        return
      }

      const entryCommandConstructor = this.entryCommand

      /**
       * Exit the process if entry command isn't a stayalive command. Stayalive
       * commands should call `this.exit` to exit the process.
       */
      if (!entryCommandConstructor.settings.stayAlive) {
        await this.exitProcess()
      }
    } catch (error) {
      await this.exitProcess(error)
    }
  }

  /**
   * Print the help screen for a given command or all commands/flags
   */
  public printHelp(
    command?: CommandConstructorContract,
    commandsToAppend?: CommandConstructorContract[],
    aliasesToAppend?: Record<string, string>
  ) {
    let { commands, aliases } = this.getAllCommandsAndAliases()

    /**
     * Append additional commands and aliases for help screen only
     */
    if (commandsToAppend) {
      commands = commands.concat(commandsToAppend)
    }
    if (aliasesToAppend) {
      aliases = Object.assign({}, aliases, aliasesToAppend)
    }

    if (command) {
      printHelpFor(command, aliases)
    } else {
      const flags = Object.keys(this.flags).map(name => this.flags[name])
      printHelp(commands, flags, aliases)
    }
  }

  /**
   * Trigger kernel to exit the process. The call to this method
   * is ignored when command is not same the `entryCommand`.
   *
   * In other words, subcommands cannot trigger exit
   */
  public async exit(command: CommandContract, error?: any) {
    if (command !== this.entryCommand) {
      return
    }

    await this.exitProcess(error)
  }
}
