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
 * Create `.editorconfig` inside destination
 */
const task: TaskFn = (_, logger, { absPath }) => {
  const editorConfig = new files.IniFile(absPath, '.editorconfig')

  /**
   * All files
   */
  editorConfig.set('*', {
    indent_style: 'space',
    indent_size: 2,
    end_of_line: 'lf',
    charset: 'utf-8',
    trim_trailing_whitespace: true,
    insert_final_newline: true
  })

  /**
   * JSON file
   */
  editorConfig.set('*.json', {
    insert_final_newline: 'ignore'
  })

  /**
   * Markdown files
   */
  editorConfig.set('*.md', {
    trim_trailing_whitespace: false
  })

  editorConfig.commit()
  logger.action('create').succeeded('.editorconfig')
}

export default task
