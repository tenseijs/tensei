/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import slash from 'slash'
import { join, relative, extname } from 'path'
import { fsReadAll } from '@poppinss/utils/build/helpers'

import { CommandsListFilterFn } from '@tensei/common'

/**
 * Checks if the file exists inside the array. Also an extension
 * agnostic check is performed to handle `.ts` and `.js` files
 * both
 */
function filesFilter(fileName: string, filesToIgnore: string[]) {
  if (filesToIgnore.includes(fileName)) {
    return true
  }

  fileName = fileName.replace(extname(fileName), '')
  return filesToIgnore.includes(fileName)
}

/**
 * Returns an array of Javascript files inside the current directory in
 * relative to the application root.
 */
export function listDirectoryFiles(
  scanDirectory: string,
  appRoot: string,
  filesToIgnore?: CommandsListFilterFn
): string[] {
  return fsReadAll(scanDirectory)
    .filter(name => !name.endsWith('.json')) // remove .json files
    .map(name => {
      const relativePath = relative(appRoot, join(scanDirectory, name))
      return slash(
        relativePath.startsWith('../') ? relativePath : `./${relativePath}`
      )
    })
    .filter(name => {
      if (typeof filesToIgnore === 'function') {
        return filesToIgnore(name)
      }

      return Array.isArray(filesToIgnore)
        ? !filesFilter(name, filesToIgnore)
        : true
    })
}
