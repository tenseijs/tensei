/*
 * adonis-ts-boilerplate
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import copyTemplates from './scaffold/copyTemplates'
import createTsConfig from './scaffold/createTsConfig'
import installDependencies from './install-dependencies'
import createGitIgnore from './scaffold/createGitIgnore'
import generateOrmTypes from './generate-orm-types'

/**
 * An array of tasks to be executed in chronological order
 */
export const tasks = function () {
  return [
    {
      title: 'Scaffold project',
      actions: [copyTemplates, createGitIgnore, createTsConfig]
    },
    {
      title: 'Install dependencies',
      actions: [installDependencies]
    },
    {
      title: 'Generate types',
      actions: [generateOrmTypes]
    }
  ]
}
