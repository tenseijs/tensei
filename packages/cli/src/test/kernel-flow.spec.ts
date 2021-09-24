/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Kernel } from '../src/Kernel'
import { BaseCommand } from '../src/BaseCommand'

import { setupApp } from '../test-helpers'
import { args } from '../src/Decorators/args'
import { flags } from '../src/Decorators/flags'

test.group('Kernel | no argv', () => {
  test('execute the default command when no argv are defined', async (assert) => {
    assert.plan(3)

    class MyDefaultCommand extends BaseCommand {
      public static commandName = 'help'
      public async run() {
        assert.isTrue(true)
      }
    }

    const kernel = new Kernel(setupApp())
    kernel.defaultCommand = MyDefaultCommand

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle([])
  })

  test('handle exceptions raised by the default command', async (assert) => {
    assert.plan(2)

    class MyDefaultCommand extends BaseCommand {
      public static commandName = 'help'
      public async run() {
        throw new Error('boom')
      }
    }

    const kernel = new Kernel(setupApp())
    kernel.defaultCommand = MyDefaultCommand

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error!.message, 'boom')
    })

    await kernel.handle([])
  })

  test('execute find hooks when running the default command', async (assert) => {
    assert.plan(3)

    const stack: string[] = []

    class MyDefaultCommand extends BaseCommand {
      public static commandName = 'help'
      public async run() {}
    }

    const kernel = new Kernel(setupApp())
    kernel.defaultCommand = MyDefaultCommand

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
      assert.deepEqual(stack, ['before-find', 'after-find'])
    })

    await kernel.handle([])
  })

  test('execute run hooks when running the default command', async (assert) => {
    assert.plan(3)

    const stack: string[] = []

    class MyDefaultCommand extends BaseCommand {
      public static commandName = 'help'
      public async run() {}
    }

    const kernel = new Kernel(setupApp())
    kernel.defaultCommand = MyDefaultCommand

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))

    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
      assert.deepEqual(stack, ['before-find', 'after-find', 'before-run', 'after-run'])
    })

    await kernel.handle([])
  })

  test('run all hooks even when default command raises an exception', async (assert) => {
    assert.plan(3)

    const stack: string[] = []

    class MyDefaultCommand extends BaseCommand {
      public static commandName = 'help'
      public async run() {
        throw new Error('boom')
      }
    }

    const kernel = new Kernel(setupApp())
    kernel.defaultCommand = MyDefaultCommand

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))

    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error!.message, 'boom')
      assert.deepEqual(stack, ['before-find', 'after-find', 'before-run', 'after-run'])
    })

    await kernel.handle([])
  })

  test('handle case where find hooks raise an exception', async (assert) => {
    assert.plan(3)

    const stack: string[] = []

    class MyDefaultCommand extends BaseCommand {
      public static commandName = 'help'
      public async run() {
        throw new Error('boom')
      }
    }

    const kernel = new Kernel(setupApp())
    kernel.defaultCommand = MyDefaultCommand

    kernel.before('find', () => {
      throw new Error('before find failed')
    })
    kernel.after('find', () => stack.push('after-find'))

    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error!.message, 'before find failed')
      assert.deepEqual(stack, [])
    })

    await kernel.handle([])
  })

  test('handle case where run hooks raise an exception', async (assert) => {
    assert.plan(3)

    const stack: string[] = []

    class MyDefaultCommand extends BaseCommand {
      public static commandName = 'help'
      public async run() {
        throw new Error('boom')
      }
    }

    const kernel = new Kernel(setupApp())
    kernel.defaultCommand = MyDefaultCommand

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))

    kernel.before('run', () => {
      throw new Error('before run failed')
    })
    kernel.after('run', () => stack.push('after-run'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error!.message, 'before run failed')
      assert.deepEqual(stack, ['before-find', 'after-find'])
    })

    await kernel.handle([])
  })

  test('handle case where "after run" hooks raise an exception', async (assert) => {
    assert.plan(3)

    const stack: string[] = []

    class MyDefaultCommand extends BaseCommand {
      public static commandName = 'help'
      public async run() {
        throw new Error('boom')
      }
    }

    const kernel = new Kernel(setupApp())
    kernel.defaultCommand = MyDefaultCommand

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))

    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => {
      throw new Error('after run failed')
    })
    kernel.after('run', () => stack.push('after-run'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error!.message, 'after run failed')
      assert.deepEqual(stack, ['before-find', 'after-find', 'before-run'])
    })

    await kernel.handle([])
  })
})

test.group('Kernel | only flags', () => {
  test('execute global flags when no command name is defined', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    kernel.flag(
      'help',
      () => {
        assert.isTrue(true)
      },
      {}
    )

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['--help'])
  })

  test('execute global flags when no command name is defined', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    kernel.flag(
      'help',
      () => {
        assert.isTrue(true)
      },
      {}
    )

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['--help'])
  })

  test('execute string type flags', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    kernel.flag(
      'env',
      (value) => {
        assert.equal(value, 'production')
      },
      {
        type: 'string',
      }
    )

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['--env=production'])
  })

  test('execute array type flags', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    kernel.flag(
      'env',
      (value) => {
        assert.deepEqual(value, ['production', 'development'])
      },
      {
        type: 'array',
      }
    )

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['--env=production,development'])
  })

  test('do not execute flag handlers when not mentioned in argv', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    kernel.flag(
      'help',
      () => {
        assert.isTrue(true)
      },
      {}
    )

    kernel.flag(
      'env',
      () => {
        throw new Error('Never expected to be called')
      },
      {}
    )

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['--help'])
  })

  test('do not execute flag of type string when not mentioned in argv', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    kernel.flag(
      'help',
      () => {
        assert.isTrue(true)
      },
      {}
    )

    kernel.flag(
      'env',
      () => {
        throw new Error('Never expected to be called')
      },
      {
        type: 'string',
      }
    )

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['--help'])
  })

  test('do not execute flag of type array when not mentioned in argv', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    kernel.flag(
      'help',
      () => {
        assert.isTrue(true)
      },
      {}
    )

    kernel.flag(
      'env',
      () => {
        throw new Error('Never expected to be called')
      },
      {
        type: 'array',
      }
    )

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['--help'])
  })

  test('handle use case when flag raises an exception', async (assert) => {
    assert.plan(2)
    const kernel = new Kernel(setupApp())

    kernel.flag(
      'env',
      () => {
        throw new Error('boom')
      },
      {
        type: 'array',
      }
    )

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error!.message, 'boom')
    })

    await kernel.handle(['--env=production,development'])
  })
})

test.group('Kernel | command found', () => {
  test('execute registered command', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
      }
    }

    kernel.register([HelloCommand])

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['hello', 'world'])
  })

  test('handle use case where command raises an exception', async (assert) => {
    assert.plan(2)
    const kernel = new Kernel(setupApp())

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        throw new Error('boom')
      }
    }

    kernel.register([HelloCommand])

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error.message, 'boom')
    })

    await kernel.handle(['hello', 'world'])
  })

  test('handle use case where long lived marks itself as failed', async (assert, done) => {
    assert.plan(2)
    const kernel = new Kernel(setupApp())

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'
      public static settings = {
        stayAlive: true,
      }

      @args.string()
      public name: string

      public async run() {
        setTimeout(() => {
          this.error = new Error('boom')
          this.exitCode = 1
          this.kernel.exit(this)
        }, 200)
      }
    }

    kernel.register([HelloCommand])

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error.message, 'boom')
      done()
    })

    await kernel.handle(['hello', 'world'])
  })

  test('handle case when command invokes kernel.exit right away', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
        this.kernel.exit(this)
      }
    }

    kernel.register([HelloCommand])

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['hello', 'world'])
  })

  test('invoke find hooks before running the command', async (assert) => {
    assert.plan(4)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
        stack.push('command')
      }
    }

    kernel.register([HelloCommand])
    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['hello', 'world'])
    assert.deepEqual(stack, ['before-find', 'after-find', 'command'])
  })

  test('invoke run hooks when running the command', async (assert) => {
    assert.plan(4)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
        stack.push('command')
      }
    }

    kernel.register([HelloCommand])
    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['hello', 'world'])
    assert.deepEqual(stack, ['before-find', 'after-find', 'before-run', 'command', 'after-run'])
  })

  test('handle case where before find hook fails', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
        stack.push('command')
      }
    }

    kernel.register([HelloCommand])
    kernel.before('find', () => {
      throw new Error('boom')
    })
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error.message, 'boom')
    })

    await kernel.handle(['hello', 'world'])
    assert.deepEqual(stack, [])
  })

  test('handle case where after find hook fails', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
        stack.push('command')
      }
    }

    kernel.register([HelloCommand])

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => {
      throw new Error('boom')
    })
    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error.message, 'boom')
    })

    await kernel.handle(['hello', 'world'])
    assert.deepEqual(stack, ['before-find'])
  })

  test('handle case where before run hook fails', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
        stack.push('command')
      }
    }

    kernel.register([HelloCommand])

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => {
      throw new Error('boom')
    })
    kernel.after('run', () => stack.push('after-run'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error.message, 'boom')
    })

    await kernel.handle(['hello', 'world'])
    assert.deepEqual(stack, ['before-find', 'after-find', 'after-run'])
  })

  test('handle case where after run fails', async (assert) => {
    assert.plan(4)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
        stack.push('command')
      }
    }

    kernel.register([HelloCommand])

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => stack.push('before-run'))

    kernel.after('run', () => {
      throw new Error('boom')
    })

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error.message, 'boom')
    })

    await kernel.handle(['hello', 'world'])
    assert.deepEqual(stack, ['before-find', 'after-find', 'before-run', 'command'])
  })

  test('invoke global flags before running the command', async (assert) => {
    assert.plan(4)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
        stack.push('command')
      }
    }

    kernel.register([HelloCommand])
    kernel.flag('env', () => stack.push('env-flag'), {
      type: 'string',
    })

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['hello', 'world', '--env=prod'])
    assert.deepEqual(stack, [
      'before-find',
      'after-find',
      'env-flag',
      'before-run',
      'command',
      'after-run',
    ])
  })

  test('handle case when global flag raises an exception', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
        stack.push('command')
      }
    }

    kernel.register([HelloCommand])
    kernel.flag(
      'env',
      () => {
        throw new Error('boom')
      },
      {
        type: 'string',
      }
    )
    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error.message, 'boom')
    })

    await kernel.handle(['hello', 'world', '--env=prod'])
    assert.deepEqual(stack, ['before-find', 'after-find'])
  })

  test('validate command args', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        stack.push('command')
      }
    }

    kernel.register([HelloCommand])

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error.message, 'E_MISSING_ARGUMENT: Missing required argument "name"')
    })

    await kernel.handle(['hello'])
    assert.deepEqual(stack, ['before-find', 'after-find'])
  })

  test('validate command flags', async (assert) => {
    assert.plan(3)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      @flags.number()
      public logLevel: number

      public async run() {
        stack.push('command')
      }
    }

    kernel.register([HelloCommand])

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(
        kernel.error.message,
        'E_INVALID_FLAG: "log-level" flag expects a "numeric" value'
      )
    })

    await kernel.handle(['hello', 'world', '--log-level'])
    assert.deepEqual(stack, ['before-find', 'after-find'])
  })
})

test.group('Kernel | command not found', () => {
  test('raise error when command is missing', async (assert) => {
    assert.plan(2)
    const kernel = new Kernel(setupApp())

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error.message, 'E_INVALID_COMMAND: "hello" is not a registered command')
    })

    await kernel.handle(['hello', 'world'])
  })

  test('run find hooks', async (assert) => {
    assert.plan(3)

    const kernel = new Kernel(setupApp())
    const stack: string[] = []

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error.message, 'E_INVALID_COMMAND: "hello" is not a registered command')
    })

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    await kernel.handle(['hello', 'world'])
    assert.deepEqual(stack, ['before-find', 'after-find'])
  })

  test('run global flag handlers', async (assert) => {
    assert.plan(3)

    const kernel = new Kernel(setupApp())
    const stack: string[] = []

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error.message, 'E_INVALID_COMMAND: "hello" is not a registered command')
    })

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))
    kernel.flag('env', () => stack.push('env-flag'), {
      type: 'string',
    })

    await kernel.handle(['hello', 'world', '--env=foo'])
    assert.deepEqual(stack, ['before-find', 'after-find', 'env-flag'])
  })
})

test.group('Kernel | subcommands', () => {
  test('allow executing commands within commands', async (assert) => {
    assert.plan(4)
    const kernel = new Kernel(setupApp())

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
        await this.kernel.exec('hi', ['world'])
      }
    }

    class HiCommand extends BaseCommand {
      public static commandName = 'hi'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
        return 'world'
      }
    }

    kernel.register([HelloCommand, HiCommand])

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['hello', 'world'])
  })

  test('do not trigger exit when subcommand finishes and the main one is pending', async (assert) => {
    assert.plan(4)
    const kernel = new Kernel(setupApp())

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
        await this.kernel.exec('hi', ['world'])
        setTimeout(() => {
          this.kernel.exit(this)
        }, 200)
      }
    }

    class HiCommand extends BaseCommand {
      public static commandName = 'hi'

      @args.string()
      public name: string

      public async run() {
        assert.equal(this.name, 'world')
      }
    }

    kernel.register([HelloCommand, HiCommand])

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    await kernel.handle(['hello', 'world'])
  })

  test('execute find hooks before the subcommand', async (assert) => {
    assert.plan(5)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        stack.push('hello-command')
        assert.equal(this.name, 'world')
        await this.kernel.exec('hi', ['world'])
      }
    }

    class HiCommand extends BaseCommand {
      public static commandName = 'hi'

      @args.string()
      public name: string

      public async run() {
        stack.push('hi-command')
        assert.equal(this.name, 'world')
      }
    }

    kernel.register([HelloCommand, HiCommand])

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))

    await kernel.handle(['hello', 'world'])
    assert.deepEqual(stack, [
      'before-find',
      'after-find',
      'hello-command',
      'before-find',
      'after-find',
      'hi-command',
    ])
  })

  test('execute run hooks before the subcommand', async (assert) => {
    assert.plan(5)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        stack.push('hello-command')
        assert.equal(this.name, 'world')
        await this.kernel.exec('hi', ['world'])
      }
    }

    class HiCommand extends BaseCommand {
      public static commandName = 'hi'

      @args.string()
      public name: string

      public async run() {
        stack.push('hi-command')
        assert.equal(this.name, 'world')
      }
    }

    kernel.register([HelloCommand, HiCommand])

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    await kernel.handle(['hello', 'world'])
    assert.deepEqual(stack, [
      'before-find',
      'after-find',
      'before-run',
      'hello-command',
      'before-find',
      'after-find',
      'before-run',
      'hi-command',
      'after-run',
      'after-run',
    ])
  })

  test('handle case when subcommand error is unhandled', async (assert) => {
    assert.plan(5)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        stack.push('hello-command')
        assert.equal(this.name, 'world')
        await this.kernel.exec('hi', ['world'])
      }
    }

    class HiCommand extends BaseCommand {
      public static commandName = 'hi'

      @args.string()
      public name: string

      public async run() {
        stack.push('hi-command')
        assert.equal(this.name, 'world')
        throw new Error('hi failed')
      }
    }

    kernel.register([HelloCommand, HiCommand])

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 1)
      assert.equal(kernel.error.message, 'hi failed')
    })

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    await kernel.handle(['hello', 'world'])
    assert.deepEqual(stack, [
      'before-find',
      'after-find',
      'before-run',
      'hello-command',
      'before-find',
      'after-find',
      'before-run',
      'hi-command',
      'after-run',
      'after-run',
    ])
  })

  test('handle case when subcommand error is handled', async (assert) => {
    assert.plan(6)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        stack.push('hello-command')
        assert.equal(this.name, 'world')

        try {
          await this.kernel.exec('hi', ['world'])
        } catch (error) {
          assert.equal(error.message, 'hi failed')
        }
      }
    }

    class HiCommand extends BaseCommand {
      public static commandName = 'hi'

      @args.string()
      public name: string

      public async run() {
        stack.push('hi-command')
        assert.equal(this.name, 'world')
        throw new Error('hi failed')
      }
    }

    kernel.register([HelloCommand, HiCommand])

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))

    await kernel.handle(['hello', 'world'])
    assert.deepEqual(stack, [
      'before-find',
      'after-find',
      'before-run',
      'hello-command',
      'before-find',
      'after-find',
      'before-run',
      'hi-command',
      'after-run',
      'after-run',
    ])
  })

  test('do not run global flags when executing subcommand', async (assert) => {
    assert.plan(5)
    const kernel = new Kernel(setupApp())

    const stack: string[] = []

    class HelloCommand extends BaseCommand {
      public static commandName = 'hello'

      @args.string()
      public name: string

      public async run() {
        stack.push('hello-command')
        assert.equal(this.name, 'world')
        await this.kernel.exec('hi', ['world', '--env=production'])
      }
    }

    class HiCommand extends BaseCommand {
      public static commandName = 'hi'

      @args.string()
      public name: string

      public async run() {
        stack.push('hi-command')
        assert.equal(this.name, 'world')
      }
    }

    kernel.register([HelloCommand, HiCommand])

    kernel.onExit(() => {
      assert.equal(kernel.exitCode, 0)
      assert.isUndefined(kernel.error)
    })

    kernel.before('find', () => stack.push('before-find'))
    kernel.after('find', () => stack.push('after-find'))
    kernel.before('run', () => stack.push('before-run'))
    kernel.after('run', () => stack.push('after-run'))
    kernel.flag('env', () => stack.push('env-flag'), {
      type: 'string',
    })

    await kernel.handle(['hello', 'world', '--env=production'])
    assert.deepEqual(stack, [
      'before-find',
      'after-find',
      'env-flag',
      'before-run',
      'hello-command',
      'before-find',
      'after-find',
      'before-run',
      'hi-command',
      'after-run',
      'after-run',
    ])
  })
})
