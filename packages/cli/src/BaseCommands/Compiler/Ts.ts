/*
 * @adonisjs/assembler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import tsStatic from 'typescript'
import { logger as uiLogger } from '@poppinss/cliui'
import { TypescriptCompiler } from '@poppinss/chokidar-ts'
import { resolveFrom } from '@poppinss/utils/build/helpers'

const TSCONFIG_FILE_NAME = 'tsconfig.json'
const DEFAULT_BUILD_DIR = 'build'

/**
 * Exposes the API to work with the Typescript compiler API
 */
export class Ts {
  /**
   * Reference to the typescript compiler
   */
  public tsCompiler = new TypescriptCompiler(
    this.appRoot,
    this.tsconfig,
    require(resolveFrom(this.appRoot, 'typescript/lib/typescript'))
  )

  constructor(
    private appRoot: string,
    private logger: typeof uiLogger,
    private tsconfig = TSCONFIG_FILE_NAME
  ) {}

  /**
   * Render ts diagnostics
   */
  public renderDiagnostics(
    diagnostics: tsStatic.Diagnostic[],
    host: tsStatic.CompilerHost
  ) {
    console.error(
      this.tsCompiler.ts.formatDiagnosticsWithColorAndContext(diagnostics, host)
    )
  }

  /**
   * Parses the tsconfig file
   */
  public parseConfig(): undefined | tsStatic.ParsedCommandLine {
    const { error, config } = this.tsCompiler.configParser().parse()

    if (error) {
      this.logger.error(`unable to parse ${this.tsconfig}`)
      this.renderDiagnostics([error], this.tsCompiler.ts.createCompilerHost({}))
      return
    }

    if (config && config.errors.length) {
      this.logger.error(`unable to parse ${this.tsconfig}`)
      this.renderDiagnostics(
        config.errors,
        this.tsCompiler.ts.createCompilerHost(config.options)
      )
      return
    }

    config!.options.rootDir = config!.options.rootDir || this.appRoot
    config!.options.outDir =
      config!.options.outDir || join(this.appRoot, DEFAULT_BUILD_DIR)
    return config
  }
}
