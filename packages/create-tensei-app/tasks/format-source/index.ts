/*
 * create-adonis-ts-app
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import execa from 'execa'
import { TaskFn } from '../../contracts'

/**
 * Format source files using prettier
 */
const task: TaskFn = async (_, __, { absPath, prettier, debug }) => {
  if (!prettier) {
    return
  }

  /**
   * Formatting source files is a secondary action and errors can be
   * ignored
   */
  try {
    await execa('npm', ['run', 'format'], {
      cwd: absPath,
      ...(debug ? { stdio: 'inherit' } : {})
    })
  } catch {}
}

export default task
