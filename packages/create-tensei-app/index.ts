/*
 * create-adonis-ts-app
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import getops from 'getopts'
import { removeSync } from 'fs-extra'
import { utils, logger, tasksUi } from '@adonisjs/sink'

import { tasks } from './tasks'
import { greet } from './chalk/greet'
import { showArt } from './chalk/art'
import { getHelp } from './chalk/help'
import { getState, usingYarn } from './helpers'

/**
 * Running all the tasks to create a new project.
 */
export async function runTasks(args: string[]) {
  console.log(await showArt())

  /**
   * Setup command line arguments
   */
  const argv = getops(args, {
    string: ['boilerplate', 'name'],
    boolean: ['eslint', 'debug', 'prettier', 'encore'],
    default: {
      eslint: null,
      debug: false,
      prettier: null,
      encore: null
    }
  })

  /**
   * Show help when no arguments are passed
   */
  if (!argv._.length) {
    console.log(getHelp(usingYarn))
    return
  }

  /**
   * First argument is the project path
   */
  const projectPath = argv._[0].trim()

  console.log('')
  console.log(logger.colors.green('CUSTOMIZE PROJECT'))

  /**
   * Setup state
   */
  const state = await getState(projectPath, {
    client: usingYarn ? 'yarn' : 'npm',
    projectName: argv.name,
    debug: argv.debug,
    boilerplate: argv.boilerplate,
    eslint: argv.eslint,
    prettier: argv.prettier,
    encore: argv.encore
  })

  /**
   * Return when directory is not empty
   */
  if (!utils.isEmptyDir(state.absPath)) {
    const errors = [
      `Cannot overwrite contents of {${projectPath}} directory.`,
      'Make sure to define path to an empty directory'
    ]

    console.log('')
    logger.error(errors.join(' '))
    return
  }

  /**
   * Decide the ui renderer to use
   */
  const tasksManager = state.debug ? tasksUi.verbose() : tasksUi()

  /**
   * Execute all tasks
   */
  tasks().forEach(({ title, actions }) => {
    tasksManager.add(title, async (taskLogger, task) => {
      for (let action of actions) {
        await action({}, taskLogger, state)
      }
      await task.complete()
    })
  })

  console.log('')
  console.log(logger.colors.green('RUNNING TASKS'))

  /**
   * Run tasks
   */
  try {
    await tasksManager.run()
  } catch (error) {
    tasksManager.state = 'failed'
    tasksManager.error = error
  }

  console.log('')

  /**
   * Notify about failure
   */
  if (tasksManager.state === 'failed') {
    logger.error('Unable to create project. Cleaning up')
    removeSync(state.absPath)
    return
  }

  /**
   * Greet the user to get started
   */
  logger.success('Project created successfully')
  greet(state)
}
