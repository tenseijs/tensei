import execa from 'execa'
import { TaskFn } from '../../contracts'
import { getInstallMessage } from '../../helpers'
import { packages } from '../../schematics/packages'

/**
 * Runs the tensei orm:types command after installation and setup.
 */
const task: TaskFn = async (_, logger, { absPath, debug }) => {
  try {
    await execa('npm', ['run', 'postinstall'], {
      cwd: absPath,
      ...(debug ? { stdio: 'inherit' } : {})
    })
  } catch {}
}

export default task
