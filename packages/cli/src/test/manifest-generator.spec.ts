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
import { ManifestGenerator } from '../src/Manifest/Generator'

test.group('Manifest Generator', (group) => {
  group.before(async () => {
    await fs.ensureRoot()
  })

  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('generate manifest from command paths', async (assert) => {
    await fs.add(
      'Commands/Make.ts',
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

    const manifest = new ManifestGenerator(fs.basePath, ['./Commands/Make.ts'])
    await manifest.generate()

    const manifestJSON = await fs.fsExtra.readJSON(join(fs.basePath, 'ace-manifest.json'))

    assert.deepEqual(manifestJSON, {
      commands: {
        greet: {
          settings: {},
          aliases: [],
          commandPath: './Commands/Make',
          commandName: 'greet',
          description: 'Greet a user',
          args: [
            {
              name: 'name',
              type: 'string',
              propertyName: 'name',
              required: true,
            },
          ],
          flags: [
            {
              name: 'adult',
              propertyName: 'adult',
              type: 'boolean',
            },
          ],
        },
      },
      aliases: {},
    })
  })

  test("raise exception when commandPath doesn't exports a command", async (assert) => {
    assert.plan(1)

    await fs.add(
      'Commands/Make.ts',
      `
    import { args, flags } from '../../../index'
    import { BaseCommand } from '../../../src/BaseCommand'

    export class Greet extends BaseCommand {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean

      public async run () {}
    }`
    )

    const manifest = new ManifestGenerator(fs.basePath, ['./Commands/Make.ts'])

    try {
      await manifest.generate()
    } catch ({ message }) {
      assert.equal(
        message,
        'Invalid command" ./Commands/Make.ts". Make sure the command is exported using the "export default"'
      )
    }
  })

  test('generate manifest from command subpaths', async (assert) => {
    await fs.add(
      'Commands/Make.ts',
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
      'Commands/index.ts',
      `
      export default [
        './Commands/Make',
      ]
    `
    )

    const manifest = new ManifestGenerator(fs.basePath, ['./Commands/index.ts'])
    await manifest.generate()

    const manifestJSON = await fs.fsExtra.readJSON(join(fs.basePath, 'ace-manifest.json'))
    assert.deepEqual(manifestJSON, {
      commands: {
        greet: {
          settings: {},
          aliases: [],
          commandPath: './Commands/Make',
          commandName: 'greet',
          description: 'Greet a user',
          args: [
            {
              name: 'name',
              type: 'string',
              propertyName: 'name',
              required: true,
            },
          ],
          flags: [
            {
              name: 'adult',
              propertyName: 'adult',
              type: 'boolean',
            },
          ],
        },
      },
      aliases: {},
    })
  })

  test('register command aliases inside manifest file', async (assert) => {
    await fs.add(
      'Commands/Make.ts',
      `
    import { args, flags } from '../../../index'
    import { BaseCommand } from '../../../src/BaseCommand'

    export default class Greet extends BaseCommand {
      public static commandName = 'greet'
      public static description = 'Greet a user'
      public static aliases = ['g', 'gr']

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean

      public async run () {}
    }`
    )

    const manifest = new ManifestGenerator(fs.basePath, ['./Commands/Make.ts'])
    await manifest.generate()

    const manifestJSON = await fs.fsExtra.readJSON(join(fs.basePath, 'ace-manifest.json'))

    assert.deepEqual(manifestJSON, {
      commands: {
        greet: {
          settings: {},
          aliases: ['g', 'gr'],
          commandPath: './Commands/Make',
          commandName: 'greet',
          description: 'Greet a user',
          args: [
            {
              name: 'name',
              type: 'string',
              propertyName: 'name',
              required: true,
            },
          ],
          flags: [
            {
              name: 'adult',
              propertyName: 'adult',
              type: 'boolean',
            },
          ],
        },
      },
      aliases: {
        g: 'greet',
        gr: 'greet',
      },
    })
  })
})
