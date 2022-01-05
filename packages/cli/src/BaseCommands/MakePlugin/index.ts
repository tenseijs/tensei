import fs from 'fs'
import path from 'path'
import execa from 'execa'
import FsExtra from 'fs-extra'
import { pascalCase, camelCase, capitalCase, paramCase } from 'change-case'
import { command } from '@tensei/common'

import { MakePluginOptions } from './types'

import { types } from './plugin/types'
import { readMe } from './plugin/readme'
import { license } from './plugin/license'
import { gitIgnore } from './plugin/gitignore'
import { webpackMix } from './plugin/webpack.mix'
import { tsconfigClient } from './plugin/tsconfig'
import { packageJson } from './plugin/package.json'
import { serverIndex } from './plugin/server/index'
import { clientIndexTsx } from './plugin/client/index.tsx'
import { tsconfigServer } from './plugin/tsconfig.server'

export const makePlugin = command('make:plugin')
  .describe('Generate a new tensei plugin project.')
  .arg({
    type: 'string',
    name: 'name',
    required: true,
    description: 'The name of the plugin'
  })
  .flag({
    type: 'boolean',
    name: 'cms',
    description: 'Generate the plugin with frontend scaffolding for the CMS'
  })
  .flag({
    type: 'string',
    name: 'client',
    description: 'Select which client to use to install dependencies.'
  })
  .run(async function () {
    const options: MakePluginOptions = {
      name: {
        default: this.argValues.name,
        camel: camelCase(this.argValues.name),
        slug: paramCase(this.argValues.name),
        pascal: pascalCase(this.argValues.name),
        capital: capitalCase(this.argValues.name)
      },
      latestTenseiVersion: getLatestTenseiVersion(),
      withFrontend: this.flagValues['cms'],
      client: getClient(this.flagValues['client'])
    }

    const content = [
      types(),
      readMe(),
      license(),
      gitIgnore(),
      webpackMix(),
      serverIndex(options),
      clientIndexTsx(options),
      packageJson(options),
      tsconfigClient(options),
      tsconfigServer(options)
    ].filter(fileContent =>
      options.withFrontend
        ? fileContent.sides.includes('frontend')
        : fileContent.sides.includes('backend')
    )

    const pluginFolderName = options.name.slug

    await this.ui
      .tasks()
      .add('create plugin folder', async (logger, task) => {
        logger.info(`Creating plugin folder...`)
        // Create plugin folder
        try {
          fs.mkdirSync(pluginFolderName)

          // Create plugin files
          content.forEach(file => {
            FsExtra.outputFileSync(
              path.resolve(process.cwd(), pluginFolderName, file.location),
              file.content
            )
          })
        } catch (error) {
          logger.error(`The folder ${pluginFolderName} already exists.`)

          return
        }

        await task.complete()
      })
      .add('Install dependencies', async (logger, task) => {
        const spinner = logger.await(
          `Installing dependencies with ${options.client}`
        )

        try {
          await execa(options.client, ['install'], {
            cwd: path.resolve(process.cwd(), pluginFolderName)
          })
        } catch (error) {
          logger.error(
            `Failed installing dependencies. You can try doing this manually with ${options.client} install.`
          )
        }

        spinner.stop()

        await task.complete()
      })
      .add('Run prettier', async (logger, task) => {
        const spinner = logger.await(`Formatting project with prettier`)

        try {
          await execa(
            options.client,
            options.client === 'npm' ? ['run', 'format'] : ['format'],
            {
              cwd: process.cwd()
            }
          )
        } catch (error) {
          logger.error(
            `Failed formatting. You can try doing this manually with ${options.client} run format.`
          )
        }

        spinner.stop()

        await task.complete()
      })
      .run()
  })

export function getLatestTenseiVersion() {
  const packageJsonFile = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'package.json')).toString()
  )

  return packageJsonFile['devDependencies']['@tensei/cli']
}

export function getClient(client: string) {
  if (client === 'npm') {
    return 'npm'
  }

  if (client === 'yarn') {
    return 'yarn'
  }

  return 'yarn'
}
