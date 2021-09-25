import { command } from '@tensei/common'
import { sticker } from '@poppinss/cliui'
import { getWatcherHelpers } from '@adonisjs/require-ts'
import {
  getProjectDirectory,
  app,
  kill,
  getAppRootPath
} from '../utils/get-app'

import { Ts } from './Compiler/Ts'

export const serve = command('serve')
  .stayAlive()
  .flag({
    name: 'watch',
    type: 'boolean',
    description: 'Watch for file changes.'
  })
  .describe('Start the HTTP server and watch for file changes.')
  .run(async function () {
    const { watch } = this.flagValues
    const isTsProject = getAppRootPath().includes('.ts')

    await this.kernel.application.listen()

    if (!watch) {
      return
    }

    const displayServerIsReadySticker = () => {
      const instance = sticker()

      instance
        .add('')
        .add(
          `Server address: ${this.logger.colors.cyan(
            this.kernel.application.ctx.serverUrl
          )}`
        )

      // if rest plugin is registered, add rest address to sticker.
      const restPlugin = this.kernel.application.ctx.plugins.find(
        plugin => plugin.config.name === 'Rest API'
      )

      const cmsPlugin = this.kernel.application.ctx.plugins.find(
        plugin => plugin.config.name === 'CMS'
      )

      if (restPlugin) {
        instance.add(
          `Rest API address: ${this.logger.colors.cyan(
            `${this.kernel.application.ctx.serverUrl}/${restPlugin.config.extra?.path}`
          )}`
        )
      }

      if (cmsPlugin) {
        instance.add(
          `CMS address: ${this.logger.colors.cyan(
            `${this.kernel.application.ctx.serverUrl}/${cmsPlugin.config.extra?.path}`
          )}`
        )
      }

      // if graphql plugin is registered, add graphql address to sticker.
      const graphqlPlugin = this.kernel.application.ctx.plugins.find(
        plugin => plugin.config.name === 'GraphQl'
      )

      if (graphqlPlugin) {
        instance.add(
          `Graphql address: ${this.logger.colors.cyan(
            `${this.kernel.application.ctx.serverUrl}/${graphqlPlugin.config.extra?.path}`
          )}`
        )
      }

      instance.add(
        `Watching filesystem for changes: ${this.logger.colors.cyan(
          watch ? 'YES' : 'NO'
        )}`
      )

      instance.render()
    }

    const restart = async () => {
      let tensei = await app()

      this.logger.info('Restarting server ...')

      await kill(this.kernel.application.server)

      this.kernel.application = tensei

      await this.kernel.application.listen()

      this.logger.success('Server restarted successfully.')
    }

    const watchHelpers = getWatcherHelpers(getProjectDirectory())

    watchHelpers.clear()

    let ts

    ts = new Ts(getProjectDirectory(), this.logger)
    const config = ts.parseConfig()

    if (!config) {
      this.logger.warning(
        'Cannot start watcher because of errors in the config file'
      )

      return
    }

    const watcher = ts.tsCompiler.watcher(config, 'raw')

    watcher.on('watcher:ready', () => {
      this.logger.info('watching file system for changes')

      displayServerIsReadySticker()
    })

    watcher.on('source:unlink', async ({ absPath, relativePath }) => {
      watchHelpers.clear(absPath)
      this.logger.action('delete').succeeded(relativePath)

      await restart()
    })

    watcher.on('source:change', async ({ absPath, relativePath }) => {
      this.logger.action('update').succeeded(relativePath)

      await restart()
    })

    watcher.watch(['.'])

    watcher.chokidar.on('error', async error => {
      this.logger.fatal(error)
      await kill(this.kernel.application.server)

      this.logger.info('shutting down')
      process.exit()
    })
  })
