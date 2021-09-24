/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'
import test from 'japa'
import { join } from 'path'

import { fs } from '../test-helpers'
import { ManifestLoader } from '../src/Manifest/Loader'
import { ManifestGenerator } from '../src/Manifest/Generator'

test.group('Manifest Generator', (group) => {
  group.before(async () => {
    await fs.ensureRoot()
  })

  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('read manifest file', async (assert) => {
    await fs.add(
      './Commands/Greet.ts',
      `
    import { args, flags } from '../../../index'
    import { BaseCommand } from '../../../src/BaseCommand'

    export default class Greet extends BaseCommand {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean

      public async handle () {}
    }`
    )

    await new ManifestGenerator(fs.basePath, ['./Commands/Greet']).generate()
    const manifestLoader = new ManifestLoader([
      {
        basePath: fs.basePath,
        manifestAbsPath: join(fs.basePath, 'ace-manifest.json'),
      },
    ])

    await manifestLoader.boot()

    assert.deepEqual(manifestLoader.getCommands(), {
      commands: [
        {
          settings: {},
          commandPath: './Commands/Greet',
          commandName: 'greet',
          description: 'Greet a user',
          aliases: [],
          args: [
            {
              name: 'name',
              propertyName: 'name',
              type: 'string',
              required: true,
            },
          ],
          flags: [
            {
              name: 'adult',
              type: 'boolean',
              propertyName: 'adult',
            },
          ],
        },
      ],
      aliases: {},
    })
  })

  test('read more than one manifest files', async (assert) => {
    await fs.add(
      './Commands/Greet.ts',
      `
    import { args, flags } from '../../../index'
    import { BaseCommand } from '../../../src/BaseCommand'

    export default class Greet extends BaseCommand {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean

      public async run () {}
    }`
    )

    await fs.add(
      './sub-app/MyCommands/Run.ts',
      `
    import { args, flags } from '../../../../index'
    import { BaseCommand } from '../../../../src/BaseCommand'

    export default class Run extends BaseCommand {
      public static commandName = 'run'
      public static description = 'Run another command'

      @args.string()
      public name: string

			public async run () {}
    }`
    )

    await new ManifestGenerator(fs.basePath, ['./Commands/Greet']).generate()
    await new ManifestGenerator(join(fs.basePath, 'sub-app'), ['./MyCommands/Run']).generate()

    const manifestLoader = new ManifestLoader([
      {
        basePath: fs.basePath,
        manifestAbsPath: join(fs.basePath, 'ace-manifest.json'),
      },
      {
        basePath: join(fs.basePath, 'sub-app'),
        manifestAbsPath: join(fs.basePath, 'sub-app', 'ace-manifest.json'),
      },
    ])

    await manifestLoader.boot()

    assert.deepEqual(manifestLoader.getCommands(), {
      commands: [
        {
          settings: {},
          commandPath: './Commands/Greet',
          commandName: 'greet',
          description: 'Greet a user',
          aliases: [],
          args: [
            {
              name: 'name',
              propertyName: 'name',
              type: 'string',
              required: true,
            },
          ],
          flags: [
            {
              name: 'adult',
              type: 'boolean',
              propertyName: 'adult',
            },
          ],
        },
        {
          settings: {},
          commandPath: './MyCommands/Run',
          commandName: 'run',
          description: 'Run another command',
          aliases: [],
          args: [
            {
              name: 'name',
              propertyName: 'name',
              type: 'string',
              required: true,
            },
          ],
          flags: [],
        },
      ],
      aliases: {},
    })
  })

  test('merge aliases of more than one command', async (assert) => {
    await fs.add(
      './Commands/Greet.ts',
      `
    import { args, flags } from '../../../index'
    import { BaseCommand } from '../../../src/BaseCommand'

    export default class Greet extends BaseCommand {
      public static commandName = 'greet'
      public static description = 'Greet a user'
      public static aliases = ['sayhi']

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean

      public async run () {}
    }`
    )

    await fs.add(
      './sub-app/MyCommands/Run.ts',
      `
    import { args, flags } from '../../../../index'
    import { BaseCommand } from '../../../../src/BaseCommand'

    export default class Run extends BaseCommand {
      public static commandName = 'run'
      public static description = 'Run another command'
      public static aliases = ['fire']

      @args.string()
      public name: string

			public async run () {}
    }`
    )

    await new ManifestGenerator(fs.basePath, ['./Commands/Greet']).generate()
    await new ManifestGenerator(join(fs.basePath, 'sub-app'), ['./MyCommands/Run']).generate()

    const manifestLoader = new ManifestLoader([
      {
        basePath: fs.basePath,
        manifestAbsPath: join(fs.basePath, 'ace-manifest.json'),
      },
      {
        basePath: join(fs.basePath, 'sub-app'),
        manifestAbsPath: join(fs.basePath, 'sub-app', 'ace-manifest.json'),
      },
    ])

    await manifestLoader.boot()

    assert.deepEqual(manifestLoader.getCommands(), {
      commands: [
        {
          settings: {},
          commandPath: './Commands/Greet',
          commandName: 'greet',
          description: 'Greet a user',
          aliases: ['sayhi'],
          args: [
            {
              name: 'name',
              propertyName: 'name',
              type: 'string',
              required: true,
            },
          ],
          flags: [
            {
              name: 'adult',
              type: 'boolean',
              propertyName: 'adult',
            },
          ],
        },
        {
          settings: {},
          commandPath: './MyCommands/Run',
          commandName: 'run',
          description: 'Run another command',
          aliases: ['fire'],
          args: [
            {
              name: 'name',
              propertyName: 'name',
              type: 'string',
              required: true,
            },
          ],
          flags: [],
        },
      ],
      aliases: {
        sayhi: 'greet',
        fire: 'run',
      },
    })
  })

  test('find if a command exists', async (assert) => {
    await fs.add(
      './Commands/Greet.ts',
      `
    import { args, flags } from '../../../index'
    import { BaseCommand } from '../../../src/BaseCommand'

    export default class Greet extends BaseCommand {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean

      public async run () {}
    }`
    )

    await fs.add(
      './sub-app/MyCommands/Run.ts',
      `
    import { args, flags } from '../../../../index'
    import { BaseCommand } from '../../../../src/BaseCommand'

    export default class Run extends BaseCommand {
      public static commandName = 'run'
      public static description = 'Run another command'

      @args.string()
      public name: string

			public async run () {}
    }`
    )

    await new ManifestGenerator(fs.basePath, ['./Commands/Greet']).generate()
    await new ManifestGenerator(join(fs.basePath, 'sub-app'), ['./MyCommands/Run']).generate()

    const manifestLoader = new ManifestLoader([
      {
        basePath: fs.basePath,
        manifestAbsPath: join(fs.basePath, 'ace-manifest.json'),
      },
      {
        basePath: join(fs.basePath, 'sub-app'),
        manifestAbsPath: join(fs.basePath, 'sub-app', 'ace-manifest.json'),
      },
    ])

    await manifestLoader.boot()
    assert.isTrue(manifestLoader.hasCommand('greet'))
    assert.isTrue(manifestLoader.hasCommand('run'))
    assert.isFalse(manifestLoader.hasCommand('make'))
  })

  test('get command manifest node', async (assert) => {
    await fs.add(
      './Commands/Greet.ts',
      `
    import { args, flags } from '../../../index'
    import { BaseCommand } from '../../../src/BaseCommand'

    export default class Greet extends BaseCommand {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean

      public async run () {}
    }`
    )

    await fs.add(
      './sub-app/MyCommands/Run.ts',
      `
    import { args, flags } from '../../../../index'
    import { BaseCommand } from '../../../../src/BaseCommand'

    export default class Run extends BaseCommand {
      public static commandName = 'run'
      public static description = 'Run another command'

      @args.string()
      public name: string

			public async run () {}
    }`
    )

    await new ManifestGenerator(fs.basePath, ['./Commands/Greet']).generate()
    await new ManifestGenerator(join(fs.basePath, 'sub-app'), ['./MyCommands/Run']).generate()

    const manifestLoader = new ManifestLoader([
      {
        basePath: fs.basePath,
        manifestAbsPath: join(fs.basePath, 'ace-manifest.json'),
      },
      {
        basePath: join(fs.basePath, 'sub-app'),
        manifestAbsPath: join(fs.basePath, 'sub-app', 'ace-manifest.json'),
      },
    ])

    await manifestLoader.boot()
    assert.deepEqual(manifestLoader.getCommand('greet'), {
      basePath: fs.basePath,
      command: {
        settings: {},
        commandPath: './Commands/Greet',
        commandName: 'greet',
        aliases: [],
        description: 'Greet a user',
        args: [
          {
            name: 'name',
            propertyName: 'name',
            type: 'string',
            required: true,
          },
        ],
        flags: [
          {
            name: 'adult',
            type: 'boolean',
            propertyName: 'adult',
          },
        ],
      },
    })

    assert.deepEqual(manifestLoader.getCommand('run'), {
      basePath: join(fs.basePath, 'sub-app'),
      command: {
        settings: {},
        aliases: [],
        commandPath: './MyCommands/Run',
        commandName: 'run',
        description: 'Run another command',
        args: [
          {
            name: 'name',
            propertyName: 'name',
            type: 'string',
            required: true,
          },
        ],
        flags: [],
      },
    })

    assert.isUndefined(manifestLoader.getCommand('make'))
  })

  test('load command', async (assert) => {
    await fs.add(
      './Commands/Greet.ts',
      `
    import { args, flags } from '../../../index'
    import { BaseCommand } from '../../../src/BaseCommand'

    export default class Greet extends BaseCommand {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean

      public async run () {}
    }`
    )

    await fs.add(
      './sub-app/MyCommands/Run.ts',
      `
    import { args, flags } from '../../../../index'
    import { BaseCommand } from '../../../../src/BaseCommand'

    export default class Run extends BaseCommand {
      public static commandName = 'run'
      public static description = 'Run another command'

      @args.string()
      public name: string

			public async run () {}
    }`
    )

    await new ManifestGenerator(fs.basePath, ['./Commands/Greet']).generate()
    await new ManifestGenerator(join(fs.basePath, 'sub-app'), ['./MyCommands/Run']).generate()

    const manifestLoader = new ManifestLoader([
      {
        basePath: fs.basePath,
        manifestAbsPath: join(fs.basePath, 'ace-manifest.json'),
      },
      {
        basePath: join(fs.basePath, 'sub-app'),
        manifestAbsPath: join(fs.basePath, 'sub-app', 'ace-manifest.json'),
      },
    ])

    await manifestLoader.boot()
    const command = await manifestLoader.loadCommand('greet')
    assert.deepEqual(command.commandName, 'greet')
    assert.isTrue(command.booted)
  })
})
