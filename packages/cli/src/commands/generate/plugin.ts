import path from 'path'
import Yargs from 'yargs'
import Listr from 'listr'
import execa from 'execa'
import { paramCase } from 'change-case'
import { runner, Logger } from 'hygen'

export const command = 'plugin <name>'

export const aliases = ['p']

export const description = 'Generate a plugin'

export const builder = (yargs: Yargs.Argv) => {
    yargs
        .positional('name', {
            description: 'The name of the plugin',
            type: 'string'
        })
        .positional('template', {
            description:
                'The template to use. Can be the default or backend only.',
            type: 'string'
        })
}

export const handler = async (args: any) => {
    const tasks = new Listr([
        {
            title: 'Generating plugin ...',
            task: () => {
                return runner([args.template || 'default', 'new', args.name], {
                    templates: path.resolve(
                        __dirname,
                        '..',
                        '..',
                        '..',
                        '_templates'
                    ),
                    cwd: process.cwd(),
                    createPrompter: () => require('enquirer'),
                    logger: new Logger(console.log.bind(console)),
                    debug: false
                })
            }
        },
        {
            title: 'Installing dependencies ...',
            task: () => {
                return execa('yarn install', {
                    shell: true,
                    cwd: path.resolve(process.cwd(), paramCase(args.name))
                })
            }
        }
    ])

    try {
        await tasks.run()
    } catch (e) {
        console.log(console.error(e.message))
        process.exit(1)
    }
}
