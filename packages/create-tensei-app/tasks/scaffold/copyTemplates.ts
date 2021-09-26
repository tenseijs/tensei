/*
 * adonis-ts-boilerplate
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { utils, files } from '@adonisjs/sink'
import { fsReadAll } from '@poppinss/utils/build/helpers'

import { TaskFn } from '../../contracts'

/**
 * Copy boilerplate files to the destination
 */
const task: TaskFn = (_, logger, state) => {
  const baseDir = join(__dirname, '..', '..', 'templates', state.boilerplate)
  const templateFiles = fsReadAll(baseDir, () => true)

  templateFiles.forEach((name: string) => {
    if (name.endsWith('.ico')) {
      utils.copyFiles(baseDir, state.absPath, [name]).forEach(file => {
        const action = logger.action('create')
        file.state === 'copied'
          ? action.succeeded(file.filePath)
          : action.skipped(file.filePath)
      })
      return
    }

    const outputFileName = name.replace(/\.txt$/, '.ts')
    const src = join(baseDir, name)
    new files.MustacheFile(state.absPath, outputFileName, src)
      .apply(state)
      .commit()
    logger.action('create').succeeded(outputFileName)
  })
}

export default task
