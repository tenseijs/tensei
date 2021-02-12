#!/usr/bin/env node

/**
 * Hugely copied from the awesome folks at Redwood.js
 *
 * https://github.com/redwoodjs/redwood/blob/main/packages/create-redwood-app/src/create-redwood-app.js
 */

import path from 'path'
import execa from 'execa'
import chalk from 'chalk'
import Listr from 'listr'
import yargs from 'yargs'
import Fs from 'fs-extra'
import { hasYarnInstalled } from './utils/helpers'

const pkg = require('../package')

const style = {
    error: chalk.bold.red,
    warning: chalk.keyword('orange'),
    success: chalk.greenBright,
    info: chalk.grey,

    header: chalk.bold.underline.hex('#e8e8e8'),
    cmd: chalk.hex('#808080'),
    tensei: chalk.hex('#56b3e2'),
    love: chalk.redBright,

    green: chalk.green
}

const { _: args, template } = yargs
    .scriptName(pkg.name)
    .usage('Usage: $0 <project directory> [option]')
    .example('$0 awesome-tensei-app' as any)
    .option('template', {
        default: 'default',
        describe: 'Define which template to create a project from.'
    })
    .version(pkg.version)
    .strict().argv

const targetDir = String(args).replace(/,/g, '-')

if (!targetDir) {
    console.error('Please specify the project directory')
    console.log(
        `  ${chalk.cyan('yarn create tensei-app')} ${chalk.green(
            '<project-directory>'
        )}`
    )
    console.log()
    console.log('For example:')
    console.log(
        `  ${chalk.cyan('yarn create tensei-app')} ${chalk.green(
            'my-tensei-app'
        )}`
    )
    process.exit(1)
}

const newAppDir = path.resolve(process.cwd(), targetDir)

const appDirExists = Fs.existsSync(newAppDir)

const templateDir = path.resolve(__dirname, '../templates')

const createProjectTasks = ({ newAppDir }: { newAppDir: string }) => {
    return [
        {
            title: `${
                appDirExists ? 'Using' : 'Creating'
            } directory '${newAppDir}'`,
            task: () => {
                if (!Fs.existsSync(path.resolve(templateDir, template))) {
                    console.error(`Template ${template} does not exist.`)
                    process.exit(1)
                }

                if (appDirExists) {
                    // make sure that the target directory is empty
                    if (Fs.readdirSync(newAppDir).length > 0) {
                        console.error(
                            `'${newAppDir}' already exists and is not empty.`
                        )
                        process.exit(1)
                    }
                } else {
                    Fs.ensureDirSync(path.dirname(newAppDir))
                }

                Fs.copySync(path.resolve(templateDir, template), newAppDir)
            }
        }
    ]
}

const installNodeModulesTasks = ({ newAppDir }: { newAppDir: string }) => {
    return [
        {
            title:
                'Running `' + 'npm' + ' install`... (This could take a while)',
            task: () => {
                return execa('npm install',
                    {
                        shell: true,
                        cwd: newAppDir,
                        stdin: 'ignore'
                    }
                )
            }
        }
    ]
}

new Listr(
    [
        {
            title: 'Creating Tensei app',
            task: () => new Listr(createProjectTasks({ newAppDir }))
        },
        {
            title: 'Installing packages',
            task: () => new Listr(installNodeModulesTasks({ newAppDir }))
        }
    ],
    { exitOnError: true }
)
    .run()
    .then(() => {
        // zOMG the semicolon below is a real Prettier thing. What??
        // https://prettier.io/docs/en/rationale.html#semicolons
        ;[
            '',
            style.success('Thanks for trying out Tensei!'),
            '',
            `We've created your app in '${style.green(newAppDir)}'`,
            `Enter the directory and run '${style.green(
                'yarn dev'
            )}' to start the development server.`,
            '',
            ` ⚡️ ${style.tensei(
                'Get up and running fast with this Quick Start guide'
            )}: https://tenseijs.com/docs/quick-start`,
            '',
            style.header('Join the Community'),
            '',
            `${style.tensei(
                ' ❖ Join our Forums'
            )}: https://github.com/tenseijs/tensei/discussions`,
            '',
            style.header('Get some help'),
            '',
            `${style.tensei(
                ' ❖ Get started with the Tutorial'
            )}: https://tenseijs.com/tutorial`,
            `${style.tensei(
                ' ❖ Read the Documentation'
            )}: https://tenseijs.com/docs`,
            '',
            style.header('Stay updated'),
            '',
            `${style.tensei(
                ' ❖ Sign up for our Newsletter'
            )}: https://tenseijs.com/newsletter`,
            `${style.tensei(
                ' ❖ Follow us on Twitter'
            )}: https://twitter.com/tenseijs`,
            '',
            `${style.header(`Become a Contributor`)} ${style.love('❤')}`,
            '',
            `${style.tensei(
                ' ❖ Learn how to get started'
            )}: https://tenseijs.com/docs/contributing`,
            `${style.tensei(
                ' ❖ Find a Good First Issue'
            )}: https://tenseijs.com/good-first-issue`,
            ''
        ].map(item => console.log(item))
    })
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
