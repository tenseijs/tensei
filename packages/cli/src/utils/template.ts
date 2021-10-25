/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { runInNewContext } from 'vm'
import Mustache from 'mustache'
import { readFileSync } from 'fs'

const STACK_REGEXP = /evalmachine\.<anonymous>:(\d+)(?::(\d+))?\n/
const STACK_REGEXP_ALL = new RegExp(STACK_REGEXP.source, 'g')

/**
 * Process string as a template literal string and processes
 * data
 */
export function template(
  tpl: string,
  data: Object,
  filename: string = 'eval',
  isMustache: boolean = false
) {
  if (isMustache) {
    return Mustache.render(tpl, data)
  }

  try {
    return runInNewContext('`' + tpl + '`', data)
  } catch (error) {
    const positions = error.stack.match(STACK_REGEXP_ALL)
    if (!positions) {
      throw error
    }

    const position: string[] = [filename]
    const tokens = positions.pop().match(STACK_REGEXP)
    if (tokens[1]) {
      position.push(tokens[1])
    }

    if (tokens[2]) {
      position.push(tokens[2])
    }
    throw new Error(`Error in template ${position.join(':')}\n${error.message}`)
  }
}

/**
 * Loads template file from the disk and process it contents
 * using the [[template]] method
 */
export function templateFromFile(
  file: string,
  data: object,
  isMustache: boolean
): string {
  const contents = readFileSync(file, 'utf8')
  return template(contents, data, file, isMustache)
}
