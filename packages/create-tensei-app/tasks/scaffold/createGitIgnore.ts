/*
 * adonis-ts-boilerplate
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { files } from '@adonisjs/sink'
import { TaskFn } from '../../contracts'

/**
 * Creates `.gitignore` file inside destination
 */
const task: TaskFn = (_, logger, { absPath }) => {
  const gitignore = new files.NewLineFile(absPath, '.gitignore')

  gitignore.add('node_modules')
  gitignore.add('build')
  gitignore.add('coverage')
  gitignore.add('.vscode')
  gitignore.add('.DS_STORE')
  gitignore.add('.env')
  gitignore.add('tmp')

  gitignore.commit()
  logger.action('create').succeeded('.gitignore')
}

export default task
