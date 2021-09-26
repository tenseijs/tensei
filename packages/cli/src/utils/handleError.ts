/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { logger } from '@poppinss/cliui'

/**
 * Handles the command errors and prints them to the console.
 */
// eslint-disable-next-line no-shadow
export function handleError(error: any, callback?: (error: any) => void | Promise<void>) {
  if (typeof callback === 'function') {
    callback(error)
  } else if (typeof error.handle === 'function') {
    error.handle(error)
  } else {
    logger.fatal(error)
  }
}
