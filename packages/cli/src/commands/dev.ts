import Fs from 'fs'
import Path from 'path'
import Yargs from 'yargs'
import Youch from 'youch'
import { Server }from 'http'
import Nodemon from 'nodemon'
import Chokidar from 'chokidar'
import KillPort from 'kill-port'
import forTerminal from 'youch-terminal'
import terminalLink from 'terminal-link'
import { TenseiContract } from '@tensei/core'

import colors from '../colors'

export interface ArgsInterface {
    forward: string
}

const port = (process.env.PORT || 8810) as number

let instance: Server|null = null

const WATCHER_IGNORE_EXTENSIONS = ['.db', '.sqlite', '-journal']

export const builder = (yargs: Yargs.Argv) => {
    yargs.positional('', {
        choices: ['api', 'web'],
        default: ['api', 'web'],
        description: `Which dev server(s) to start`,
        type: '' as any
    })
    .epilogue(`
        Also see the ${terminalLink(
            'Tensei CLI Reference',
            'https://tenseijs.com/reference/command-line-interface#dev'
        )}
    `)
}

const getApiFilePath = (file: string) => {
    return Path.resolve(process.cwd(), file)
}

export const watchFilesWithChokidar = () => {

}

export const getFileName = () => {
    let file: string = ''

    // First, require the tensei app
    if (Fs.existsSync(getApiFilePath('api.js'))) {
        file = 'api.js'
    } else if (Fs.existsSync(
        getApiFilePath('server.js')
    )) {
        file = 'server.js'
    } else if (
        Fs.existsSync(
            getApiFilePath('tensei.js')
        )
    ) {
        file = 'tensei.js'
    } else {
        console.error(
            colors.error(`Could not find an API file. Please create either an api,server, or tensei.js file at your project root.`)
        )
        process.exit(1)
    }

    return file
}

export const getApiFile = () => {
    return getApiFilePath(getFileName())
}

export const getTenseiInstance = () => {
    const filePath = getApiFile()

    Object.keys(require.cache).forEach((id) => {
        if (id === filePath) {
            delete require.cache[filePath]
        }
    })

    return require(getApiFile())
}

export const errorHandler = async (error: Error) => forTerminal(await new Youch(error, null).toJSON())

export const reloadTenseiApp = async (tensei: TenseiContract = getTenseiInstance()) => {
    // Third, run the migrate command on the tensei app
    await tensei.migrate()
    
    // .catch(errorHandler)
    // Fourth, run the listen command on the tensei app
    instance = await tensei.listen(port)
    
    // .catch(errorHandler)
}

export const handler = async () => {
    await reloadTenseiApp()

    const watcher = Chokidar.watch(getFileName(), {
        ignored: (file: string) => file.includes('node_modules') || WATCHER_IGNORE_EXTENSIONS.some((ext) => file.endsWith(ext)),
    })
    
    watcher.on('ready', () => {
        watcher.on('all', async (event, path) => {
            if (event === 'change') {
                let startBuild = new Date().getTime()

                process.stdout.write('Change detected, building... \n')

                instance?.close(async () => {
                    await reloadTenseiApp()

                    console.log(`Done. Took ${new Date().getTime() - startBuild}ms.`)
                })
            }
        })
    })
}
