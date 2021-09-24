import { command } from '@tensei/common'
import { getWatcherHelpers } from '@adonisjs/require-ts'
import { logger as uiLogger, sticker } from '@poppinss/cliui'
import { app, kill } from '../utils/get-app'
import { Ts } from './Compiler/Ts'

export const serve = command('serve')
  .stayAlive()
  .describe('Start the HTTP server and watch for file changes.')
  .run(async function () {
    const ts = new Ts(process.cwd(), this.logger)

    console.log('========@process.cwd()', process.cwd())

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
    })

    await this.kernel.application.listen()

    watcher.on('source:change', async ({ absPath, relativePath }) => {
      this.logger.action('update').succeeded(relativePath)

      let tensei = await app()

      this.logger.info('Restarting server ...')

      await kill(this.kernel.application.server)

      this.kernel.application = tensei

      await this.kernel.application.listen()

      this.logger.success('Server restarted successfully.')
    })
  })
