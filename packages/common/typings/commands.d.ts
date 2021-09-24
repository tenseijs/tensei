declare module '@tensei/common/commands' {
  import { DataPayload, Config, TenseiContract } from '@tensei/common/config'

  /*
   * @adonisjs/ace
   *
   * (c) Harminder Virk <virk@adonisjs.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */

  import * as ui from '@poppinss/cliui'
  import { ParsedOptions } from 'getopts'
  import { PromptContract } from '@poppinss/prompts'

  /**
   * Settings excepted by the command
   */
  export type CommandSettings = {
    loadApp?: boolean
    stayAlive?: boolean
    environment?: any
  } & { [key: string]: any }

  /**
   * The types of flags can be defined on a command.
   */
  export type FlagTypes = 'string' | 'number' | 'boolean' | 'array' | 'numArray'

  /**
   * The types of arguments can be defined on a command.
   */
  export type ArgTypes = 'string' | 'spread'

  /**
   * The shape of command argument
   */
  export type CommandArg = {
    propertyName: string
    name: string
    type: ArgTypes
    required: boolean
    description?: string
  }

  /**
   * The shape of a command flag
   */
  export type CommandFlag = {
    propertyName: string
    name: string
    type: FlagTypes
    description?: string
    alias?: string
  }

  /**
   * The handler that handles the global
   * flags
   */
  export type GlobalFlagHandler = (
    value: any,
    parsed: ParsedOptions,
    command?: CommandConstructorContract
  ) => any

  /**
   * Shape of grouped commands. Required when displaying
   * help
   */
  export type CommandsGroup = {
    group: string
    commands: SerializedCommand[]
  }[]

  /**
   * The shared properties that exists on the command implementation
   * as well as it's serialized version
   */
  export type SerializedCommand = {
    args: CommandArg[]
    aliases: string[]
    settings: CommandSettings
    flags: CommandFlag[]
    commandName: string
    description: string
  }

  export interface CommandConstructorContract extends CommandContract {}

  /**
   * The shape of command class
   */
  export interface CommandContract extends SerializedCommand {
    parsed?: ParsedOptions
    error?: any
    exitCode?: number
    logger: typeof ui.logger
    prompt: PromptContract
    colors: typeof ui.logger.colors
    ui: typeof ui
    kernel: KernelContract
    options: {
      handler?: () => Promise<any>
      prepare?: () => Promise<any>
      completed?: () => Promise<any>
    }

    onExit(callback: () => Promise<void> | void): this
    exit(): Promise<void>

    exec(): Promise<any>

    setName(name: string): this

    stayAlive(): this

    arg(arg: Partial<Omit<CommandArg, 'propertyName'>>): this
    flag(arg: Partial<Omit<CommandFlag, 'propertyName'>>): this

    describe(description: string): this

    run<T extends CommandContract>(
      callback: (this: T) => Promise<any> | any
    ): this
    prepare(callback: () => Promise<any> | any): this
    completed(callback: () => Promise<any> | any): this

    $addArgument(options: Partial<CommandArg>): void

    $addFlag(options: Partial<CommandFlag>): void
  }

  /**
   * Shape of defined aliases
   */
  export type Aliases = { [key: string]: string }

  /**
   * Callbacks for different style of hooks
   */
  export type FindHookCallback = (
    command: SerializedCommand | null
  ) => Promise<any> | any
  export type RunHookCallback = (command: CommandContract) => Promise<any> | any

  /**
   * Shape of ace kernel
   */
  export interface KernelContract {
    /**
     * The exit code to be used for exiting the process. One should use
     * this to exit the process
     */
    exitCode?: number

    /**
     * Reference to the process error. It can come from the command, flags
     * or any other intermediate code.
     */
    error?: Error

    /**
     * Reference to the default command. Feel free to overwrite it
     */
    defaultCommand: CommandConstructorContract

    /**
     * A map of locally registered commands
     */
    commands: { [name: string]: CommandConstructorContract }

    /**
     * Registered command aliases
     */
    aliases: Aliases

    /**
     * A map of global flags
     */
    flags: { [name: string]: CommandFlag & { handler: GlobalFlagHandler } }

    application: TenseiContract

    /**
     * Register before hooks
     */
    before(action: 'run', callback: RunHookCallback): this
    before(action: 'find', callback: FindHookCallback): this
    before(
      action: 'run' | 'find',
      callback: RunHookCallback | FindHookCallback
    ): this

    /**
     * Register after hooks
     */
    after(action: 'run', callback: RunHookCallback): this
    after(action: 'find', callback: FindHookCallback): this
    after(
      action: 'run' | 'find',
      callback: RunHookCallback | FindHookCallback
    ): this

    /**
     * Register a command directly via class
     */
    register(commands: CommandConstructorContract[]): this

    /**
     * Register a global flag
     */
    flag(
      name: string,
      handler: GlobalFlagHandler,
      options: Partial<Exclude<CommandFlag, 'name' | 'propertyName'>>
    ): this

    /**
     * Register an on exit callback listener. It should always
     * exit the process
     */
    onExit(callback: (kernel: this) => void | Promise<void>): this

    /**
     * Get command suggestions
     */
    getSuggestions(name: string, distance?: number): string[]

    /**
     * Find a command using the command line `argv`
     */
    find(argv: string[]): Promise<CommandConstructorContract | null>

    /**
     * Run the default command
     */
    runDefaultCommand(): Promise<any>

    /**
     * Handle the command line argv to execute commands
     */
    handle(argv: string[]): Promise<any>

    /**
     * Execute a command by its name and args
     */
    exec(commandName: string, args: string[]): Promise<any>

    /**
     * Print help for all commands or a given command
     */
    printHelp(
      command?: CommandConstructorContract,
      commandsToAppend?: ManifestCommand[],
      aliasesToAppend?: Record<string, string>
    ): void

    /**
     * Trigger exit flow
     */
    exit(command: CommandContract, error?: any): Promise<void>
  }

  /**
   * Template generator options
   */
  export type GeneratorFileOptions = {
    pattern?: 'pascalcase' | 'camelcase' | 'snakecase' | 'dashcase'
    form?: 'singular' | 'plural'
    formIgnoreList?: string[]
    suffix?: string
    prefix?: string
    extname?: string
  }

  /**
   * Shape of the individual generator file
   */
  export interface GeneratorFileContract {
    state: 'persisted' | 'removed' | 'pending'

    /**
     * Define path to the stub template. You can also define inline text instead
     * of relying on a template file, but do make sure to set `raw=true` inside
     * the options when using inline text.
     */
    stub(fileOrContents: string, options?: { raw: boolean }): this

    /**
     * Instruct to use mustache templating syntax, instead of template literals
     */
    useMustache(): this

    /**
     * The relative path to the destination directory.
     */
    destinationDir(directory: string): this

    /**
     * Define a custom application root. Otherwise `process.cwd()` is used.
     */
    appRoot(directory: string): this

    /**
     * Apply data to the stub
     */
    apply(contents: any): this

    /**
     * Get file properties as a JSON object
     */
    toJSON(): {
      filename: string
      filepath: string
      extension: string
      contents: string
      relativepath: string
      state: 'persisted' | 'removed' | 'pending'
    }
  }

  /**
   * Filter function for filtering files during the `readdir` scan
   */
  export type CommandsListFilterFn = ((name: string) => boolean) | string[]

  export const command: (name: string) => CommandContract
}
