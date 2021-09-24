/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { listDirectoryFiles } from '../utils/listDirectoryFiles'

const fs = new Filesystem(join(__dirname, './app'))

test.group('listDirectoryFiles', group => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('get a list of javascript files from a given directory', async assert => {
    await fs.add('foo.js', '')
    await fs.add('bar.js', '')
    await fs.add('baz.js', '')
    await fs.add('README.md', '')
    await fs.add('.gitkeep', '')

    const directories = listDirectoryFiles(fs.basePath, fs.basePath)
    assert.deepEqual(directories, ['./bar.js', './baz.js', './foo.js'])
  })

  test('allow inline files filter', async assert => {
    await fs.add('foo.js', '')
    await fs.add('bar.js', '')
    await fs.add('baz.js', '')
    await fs.add('README.md', '')
    await fs.add('.gitkeep', '')

    const directories = listDirectoryFiles(fs.basePath, fs.basePath, name => {
      return name !== './baz.js'
    })
    assert.deepEqual(directories, ['./bar.js', './foo.js'])
  })

  test('define nested directories', async assert => {
    await fs.add('commands/foo.js', '')
    await fs.add('commands/bar.js', '')
    await fs.add('commands/baz.js', '')
    await fs.add('commands/README.md', '')
    await fs.add('commands/.gitkeep', '')

    const directories = listDirectoryFiles(
      join(fs.basePath, 'commands'),
      fs.basePath,
      name => {
        return name !== './commands/baz.js'
      }
    )

    assert.deepEqual(directories, ['./commands/bar.js', './commands/foo.js'])
  })

  test('ignore files by defining list of ignored files', async assert => {
    await fs.add('commands/foo.js', '')
    await fs.add('commands/bar.js', '')
    await fs.add('commands/baz.js', '')
    await fs.add('commands/README.md', '')
    await fs.add('commands/.gitkeep', '')

    const directories = listDirectoryFiles(
      join(fs.basePath, 'commands'),
      fs.basePath,
      ['./commands/baz.js']
    )

    assert.deepEqual(directories, ['./commands/bar.js', './commands/foo.js'])
  })

  test('ignore files by defining list of ignored extension agnostic files', async assert => {
    await fs.add('commands/foo.js', '')
    await fs.add('commands/bar.js', '')
    await fs.add('commands/baz.js', '')
    await fs.add('commands/README.md', '')
    await fs.add('commands/.gitkeep', '')

    const directories = listDirectoryFiles(
      join(fs.basePath, 'commands'),
      fs.basePath,
      ['./commands/baz']
    )

    assert.deepEqual(directories, ['./commands/bar.js', './commands/foo.js'])
  })
})
