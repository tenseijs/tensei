/*
 * @adonisjs/assembler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import slash from 'slash'
import copyfiles from 'cpy'
import tsStatic from 'typescript'
import { join, relative } from 'path'
import { remove, outputJSON } from 'fs-extra'
import { logger as uiLogger, instructions } from '@poppinss/cliui'

import { Ts } from './Ts'

/**
 * Exposes the API to build the AdonisJs project for development or
 * production. The production build has it's own set of node_modules
 */
export class Compiler {
  /**
   * Reference to typescript compiler
   */
  private ts: Ts

  constructor(
    public appRoot: string,
    private logger: typeof uiLogger = uiLogger,
    tsconfig?: string
  ) {
    this.ts = new Ts(this.appRoot, this.logger, tsconfig)
  }

  /**
   * Returns relative unix path from the project root. Used for
   * display only
   */
  private getRelativeUnixPath(absPath: string): string {
    return slash(relative(this.appRoot, absPath))
  }

  /**
   * Cleans up the build directory
   */
  private async cleanupBuildDirectory(outDir: string) {
    this.getRelativeUnixPath(outDir)
    this.logger.info(
      `cleaning up ${this.logger.colors
        .dim()
        .yellow(`"./${this.getRelativeUnixPath(outDir)}"`)} directory`
    )
    await remove(outDir)
  }

  /**
   * Copy files to destination directory
   */
  private async copyFiles(files: string[], outDir: string) {
    try {
      await copyfiles(files, outDir, { cwd: this.appRoot, parents: true })
    } catch (error: any) {
      if (!error.message.includes("the file doesn't exist")) {
        throw error
      }
    }
  }

  /**
   * Build typescript source files
   */
  private buildTypescriptSource(
    config: tsStatic.ParsedCommandLine
  ): {
    skipped: boolean
    hasErrors: boolean
  } {
    this.logger.info('compiling typescript source files')

    const builder = this.ts.tsCompiler.builder(config)
    const { skipped, diagnostics } = builder.build()

    if (skipped) {
      this.logger.warning('typescript emit skipped')
    }

    if (diagnostics.length) {
      this.logger.error('typescript compiler errors')
      this.ts.renderDiagnostics(diagnostics, builder.host)
    }

    return {
      skipped,
      hasErrors: diagnostics.length > 0
    }
  }

  /**
   * Log the message that ts build and failed
   */
  private logTsBuildFailed() {
    this.logger.logError('')
    this.logger.logError(
      this.logger.colors.bgRed(
        `Cannot complete the build process as there are typescript errors. Use "--ignore-ts-errors" flag to ignore Typescript errors`
      )
    )
  }

  /**
   * Compile project. See [[Compiler.compileForProduction]] for
   * production build
   */
  public async compile(
    stopOnError: boolean = true,
    extraFiles?: string[]
  ): Promise<boolean> {
    const config = this.ts.parseConfig()
    if (!config) {
      return false
    }

    /**
     * Always cleanup the out directory
     */
    await this.cleanupBuildDirectory(config.options.outDir!)

    /**
     * Build typescript source
     */
    const ts = this.buildTypescriptSource(config)

    /**
     * Do not continue when output was skipped
     */
    if (ts.skipped) {
      return false
    }

    /**
     * Do not continue when has errors and "stopOnError" is true
     */
    if (stopOnError && ts.hasErrors) {
      this.logTsBuildFailed()
      await this.cleanupBuildDirectory(config.options.outDir!)
      return false
    }

    this.logger.success('built successfully')
    return true
  }

  /**
   * Compile project. See [[Compiler.compile]] for development build
   */
  public async compileForProduction(
    stopOnError: boolean = true,
    client: 'npm' | 'yarn'
  ): Promise<boolean> {
    const config = this.ts.parseConfig()
    if (!config) {
      return false
    }

    const pkgFiles =
      client === 'npm'
        ? ['package.json', 'package-lock.json']
        : ['package.json', 'yarn.lock']

    /**
     * Always cleanup the out directory
     */
    await this.cleanupBuildDirectory(config.options.outDir!)

    /**
     * Build typescript source
     */
    const { skipped, hasErrors } = this.buildTypescriptSource(config)

    /**
     * Do not continue when output was skipped
     */
    if (skipped) {
      return false
    }

    /**
     * Do not continue when has errors and "stopOnError" is true and cleanup
     * the build directory
     */
    if (stopOnError && hasErrors) {
      this.logTsBuildFailed()
      await this.cleanupBuildDirectory(config.options.outDir!)
      return false
    }

    /**
     * Print usage instructions
     */
    const installCommand =
      client === 'npm' ? 'npm ci --production' : 'yarn install --production'
    const relativeBuildPath = this.getRelativeUnixPath(config.options.outDir!)

    this.logger.success('built successfully')
    this.logger.log('')

    instructions()
      .heading('Run the following commands to start the server in production')
      .add(this.logger.colors.cyan(`cd ${relativeBuildPath}`))
      .add(this.logger.colors.cyan(installCommand))
      .add(this.logger.colors.cyan('node server.js'))
      .render()

    return true
  }
}
