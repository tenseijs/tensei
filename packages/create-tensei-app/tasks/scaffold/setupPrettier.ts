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
 * Setup prettier inside the project
 */
const task: TaskFn = (_, logger, { absPath, prettier, eslint, pkg }) => {
  if (!eslint || !prettier) {
    return
  }

  /**
   * Create prettierrc file
   */
  const prettierRc = new files.JsonFile(absPath, '.prettierrc')
  prettierRc.set('trailingComma', 'es5')
  prettierRc.set('semi', false)
  prettierRc.set('singleQuote', true)
  prettierRc.set('useTabs', false)
  prettierRc.set('quoteProps', 'consistent')
  prettierRc.set('bracketSpacing', true)
  prettierRc.set('arrowParens', 'always')
  prettierRc.set('printWidth', 100)
  prettierRc.commit()

  /**
   * Create prettier ignore file
   */
  const prettierIgnore = new files.NewLineFile(absPath, '.prettierignore')
  prettierIgnore.add('build')
  prettierIgnore.commit()

  /**
   * Setup package.json file
   */
  pkg.install('prettier')
  pkg.install('eslint-config-prettier')
  pkg.install('eslint-plugin-prettier')
  pkg.setScript('format', 'prettier --write .')

  logger.action('create').succeeded('.prettierrc, .prettierignore')
}

export default task
