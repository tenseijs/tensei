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
 * Setup eslint inside the project
 */
const task: TaskFn = (_, logger, { absPath, prettier, eslint, pkg }) => {
  if (!eslint) {
    return
  }

  /**
   * Create eslintRc file
   */
  const eslintRc = new files.JsonFile(absPath, '.eslintrc.json')

  /**
   * Setup config for prettier
   */
  if (prettier) {
    eslintRc.set('extends', ['plugin:adonis/typescriptApp', 'prettier'])
    eslintRc.set('plugins', ['prettier'])
    eslintRc.set('rules', {
      'prettier/prettier': ['error']
    })
  } else {
    // or setup without prettier
    eslintRc.set('extends', ['plugin:adonis/typescriptApp'])
  }

  eslintRc.commit()

  /**
   * Create eslintIgnore file
   */
  const eslintIgnore = new files.NewLineFile(absPath, '.eslintignore')
  eslintIgnore.add('build')
  eslintIgnore.commit()

  /**
   * Setup package.json file
   */
  pkg.install('eslint')
  pkg.install('eslint-plugin-adonis')
  pkg.setScript('lint', 'eslint . --ext=.ts')

  logger.action('create').succeeded('.eslintrc.json, .eslintignore')
}

export default task
