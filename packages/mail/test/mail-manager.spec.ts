/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'

import {
	MailersList,
	MessageNode,
	MailerContract,
	MailDriverContract,
} from '@tensei/mail'

import { Mailer } from '../src/Mail/Mailer'
import { SesDriver } from '../src/Drivers/Ses'
import { SmtpDriver } from '../src/Drivers/Smtp'
import { MailManager } from '../src/Mail/MailManager'
import { MailgunDriver } from '../src/Drivers/Mailgun'
import { SparkPostDriver } from '../src/Drivers/SparkPost'

test.group('Mail Manager', (group) => {
	test('return driver for a given mapping', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'smtp',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		assert.equal(manager['getMappingDriver']('marketing'), 'smtp')
	})

	test('return default mapping name', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'smtp',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		assert.equal(manager['getDefaultMappingName'](), 'marketing')
	})

	test('return config for a mapping name', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'smtp',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		assert.deepEqual(manager['getMappingConfig']('marketing'), { driver: 'smtp' })
	})

	test('extend mailer by adding a custom driver', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'mydriver',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		const mydriver = {
			async send() {},
			close() {},
		}

		manager.extend('mydriver', () => mydriver)
		assert.deepEqual(manager['getMappingConfig']('marketing'), { driver: 'mydriver' })
		assert.deepEqual(manager['makeExtendedDriver']('marketing', 'mydriver').driver, mydriver)
	})
})

test.group('Mail Manager | Cache', (group) => {
	test('close driver and release it from cache', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: MessageNode = {} as any
			public closed: boolean = false

			public async send(message: any) {
				this.message = message
			}

			public async close() {
				this.closed = true
			}
		}

		const customDriver = new CustomDriver()

		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		const mailer = manager.use()
		assert.instanceOf(manager['mappingsCache'].get('marketing')!, Mailer)
		assert.instanceOf(manager['mappingsCache'].get('marketing')!.driver, CustomDriver)

		await mailer.close()
		assert.equal(manager['mappingsCache'].size, 0)
		assert.isTrue(customDriver.closed)
	})

	test('close driver by invoking close on manager instance', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: MessageNode = {} as any
			public closed: boolean = false

			public async send(message: any) {
				this.message = message
			}

			public async close() {
				this.closed = true
			}
		}

		const customDriver = new CustomDriver()

		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		manager.use()
		assert.instanceOf(manager['mappingsCache'].get('marketing')!, Mailer)
		assert.instanceOf(manager['mappingsCache'].get('marketing')!.driver, CustomDriver)

		await manager.close('marketing' as any)
		assert.equal(manager['mappingsCache'].size, 0)
		assert.isTrue(customDriver.closed)
	})

	test('close all mappings and clear cache', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: MessageNode = {} as any
			public closed: boolean = false

			public async send(message: any) {
				this.message = message
			}

			public async close() {
				this.closed = true
			}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		manager.use()
		assert.equal(manager['mappingsCache'].size, 1)
		assert.instanceOf(manager['mappingsCache'].get('marketing')!, Mailer)
		assert.instanceOf(manager['mappingsCache'].get('marketing')!.driver, CustomDriver)

		await manager.closeAll()
		assert.equal(manager['mappingsCache'].size, 0)
		assert.isTrue(customDriver.closed)
	})
})

test.group('Mail Manager | SMTP', (group) => {
	test('get mailer instance for smtp driver', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'smtp',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)

		const mailer = manager.use() as MailerContract<keyof MailersList>

		assert.instanceOf(mailer, Mailer)
		assert.instanceOf(mailer.driver, SmtpDriver)
	})

	test('cache mailer instances for smtp', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'smtp',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)

		const mailer = manager.use()
		const mailer1 = manager.use()

		assert.deepEqual(mailer, mailer1)
	})
})

test.group('Mail Manager | SES', (group) => {
	test('get mailer instance for ses driver', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'ses',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		const mailer = manager.use()

		assert.instanceOf(mailer, Mailer)
		assert.instanceOf(mailer.driver, SesDriver)
	})

	test('cache mailer instances for ses driver', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'ses',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		const mailer = manager.use()
		const mailer1 = manager.use()

		assert.deepEqual(mailer, mailer1)
	})
})

test.group('Mail Manager | Mailgun', (group) => {
	test('get mailer instance for mailgun driver', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'mailgun',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		const mailer = manager.use()

		assert.instanceOf(mailer, Mailer)
		assert.instanceOf(mailer.driver, MailgunDriver)
	})

	test('cache mailer instances for mailgun driver', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'mailgun',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		const mailer = manager.use()
		const mailer1 = manager.use()

		assert.deepEqual(mailer, mailer1)
	})
})

test.group('Mail Manager | SparkPost', (group) => {
	test('get mailer instance for sparkpost driver', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'sparkpost',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		const mailer = manager.use()

		assert.instanceOf(mailer, Mailer)
		assert.instanceOf(mailer.driver, SparkPostDriver)
	})

	test('cache mailer instances for sparkpost driver', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'sparkpost',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		const mailer = manager.use()
		const mailer1 = manager.use()

		assert.deepEqual(mailer, mailer1)
	})
})

test.group('Mail Manager | Views', (group) => {
	test('make html view before sending the email', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: MessageNode = {} as any
			public closed: boolean = false

			public async send(message: any) {
				this.message = message
			}

			public async close() {
				this.closed = true
			}
		}

		const customDriver = new CustomDriver()

		const manager = new MailManager(config as any, console as any)

		manager.view!.registerTemplate('welcome', { template: '<p>Hello {{ username }}</p>' })

		manager.extend('custom', () => {
			return customDriver
		})

		await manager.use().send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Greetings')
			message.htmlView('welcome', { username: 'virk' })
		})

		assert.deepEqual(customDriver.message, {
			to: [{ address: 'foo@bar.com' }],
			from: { address: 'baz@bar.com' },
			subject: 'Greetings',
			html: '<p>Hello virk</p>',
		})
	})

	test('do not make html view when inline html is defined', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: MessageNode = {} as any
			public closed: boolean = false

			public async send(message: any) {
				this.message = message
			}

			public async close() {
				this.closed = true
			}
		}

		const customDriver = new CustomDriver()

		const manager = new MailManager(config as any, console as any)
		manager.view!.registerTemplate('welcome', { template: '<p>Hello {{ username }}</p>' })

		manager.extend('custom', () => {
			return customDriver
		})

		await manager.use().send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Greetings')
			message.htmlView('welcome', { username: 'virk' })
			message.html('<p>Hello everyone</p>')
		})

		assert.deepEqual(customDriver.message, {
			to: [{ address: 'foo@bar.com' }],
			from: { address: 'baz@bar.com' },
			subject: 'Greetings',
			html: '<p>Hello everyone</p>',
		})
	})

	test('make text view before sending the email', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: MessageNode = {} as any
			public options: any

			public async send(message: any, options: any) {
				this.message = message
				this.options = options
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.view!.registerTemplate('welcome', { template: 'Hello {{ username }}' })

		manager.extend('custom', () => {
			return customDriver
		})

		await manager.use().send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Greetings')
			message.textView('welcome', { username: 'virk' })
		})

		assert.deepEqual(customDriver.message, {
			to: [{ address: 'foo@bar.com' }],
			from: { address: 'baz@bar.com' },
			subject: 'Greetings',
			text: 'Hello virk',
		})
	})

	test('do not make text view when inline text is defined', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: MessageNode = {} as any
			public options: any

			public async send(message: any, options: any) {
				this.message = message
				this.options = options
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.view!.registerTemplate('welcome', { template: 'Hello {{ username }}' })

		manager.extend('custom', () => {
			return customDriver
		})

		await manager.use().send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Greetings')
			message.textView('welcome', { username: 'virk' })
			message.text('Hello everyone')
		})

		assert.deepEqual(customDriver.message, {
			to: [{ address: 'foo@bar.com' }],
			from: { address: 'baz@bar.com' },
			subject: 'Greetings',
			text: 'Hello everyone',
		})
	})

	test('make watch view before sending the email', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: MessageNode = {} as any
			public options: any

			public async send(message: any, options: any) {
				this.message = message
				this.options = options
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.view!.registerTemplate('welcome', { template: 'Hello {{ username }}' })

		manager.extend('custom', () => {
			return customDriver
		})

		await manager.use().send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Greetings')
			message.watchView('welcome', { username: 'virk' })
		})

		assert.deepEqual(customDriver.message, {
			to: [{ address: 'foo@bar.com' }],
			from: { address: 'baz@bar.com' },
			subject: 'Greetings',
			watch: 'Hello virk',
		})
	})

	test('do not make watch view when inline text is defined', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: any
			public options: any

			public async send(message: any, options: any) {
				this.message = message
				this.options = options
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.view!.registerTemplate('welcome', { template: 'Hello {{ username }}' })

		manager.extend('custom', () => {
			return customDriver
		})

		await manager.use().send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Greetings')
			message.watchView('welcome', { username: 'virk' })
			message.watch('Hello everyone')
		})

		assert.deepEqual(customDriver.message, {
			to: [{ address: 'foo@bar.com' }],
			from: { address: 'baz@bar.com' },
			subject: 'Greetings',
			watch: 'Hello everyone',
		})
	})
})

test.group('Mail Manager | send', (group) => {
	test('send email', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: any
			public options: any

			public async send(message: any, options: any) {
				this.message = message
				this.options = options
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		await manager.use().send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
		})

		assert.deepEqual(customDriver.message, {
			to: [{ address: 'foo@bar.com' }],
			from: { address: 'baz@bar.com' },
			subject: 'Hello world',
		})
	})

	test('pass config all the way to the driver send method', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: any
			public options: any

			public async send(message: any, options: any) {
				this.message = message
				this.options = options
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		await (manager.use() as any).send(() => {}, { foo: 'bar' })
		assert.deepEqual(customDriver.options, { foo: 'bar' })
	})
})

test.group('Mail Manager | sendLater', (group) => {
	test('schedule emails for sending', async (assert, done) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: any
			public options: any

			public async send(message: any, options: any): Promise<void> {
				return new Promise((resolve) => {
					setTimeout(() => {
						this.message = message
						this.options = options
						resolve()
					}, 1000)
				})
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		manager.monitorQueue(() => {
			assert.deepEqual(customDriver.message, {
				to: [{ address: 'foo@bar.com' }],
				from: { address: 'baz@bar.com' },
				subject: 'Hello world',
			})
			done()
		})

		await manager.use().sendLater((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
		})
	})

	test('pass config all the way to the driver send method', async (assert, done) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: any
			public options: any

			public async send(message: any, options: any): Promise<void> {
				return new Promise((resolve) => {
					setTimeout(() => {
						this.message = message
						this.options = options
						resolve()
					}, 1000)
				})
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		manager.monitorQueue(() => {
			assert.deepEqual(customDriver.options, { foo: 'bar' })
			done()
		})

		await (manager.use() as any).sendLater(() => {}, { foo: 'bar' })
	})
})

test.group('Mail Manager | trap', (group) => {
	test('trap mail send call', async (assert) => {
		assert.plan(2)

		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: any
			public options: any

			public async send(message: any, options: any) {
				this.message = message
				this.options = options
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		manager.trap((message) => {
			assert.deepEqual(message, {
				to: [{ address: 'foo@bar.com' }],
				from: { address: 'baz@bar.com' },
				subject: 'Hello world',
			})
		})

		await manager.use().send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
		})

		assert.isUndefined(customDriver.message)
	})

	test('get rendered view content inside the trap callback', async (assert) => {
		assert.plan(2)

		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: any
			public options: any

			public async send(message: any, options: any) {
				this.message = message
				this.options = options
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		manager.trap((message) => {
			assert.deepEqual(message, {
				to: [{ address: 'foo@bar.com' }],
				from: { address: 'baz@bar.com' },
				subject: 'Hello world',
				html: '<p> Hello virk </p>',
			})
		})

		manager.view!.registerTemplate('welcome', { template: '<p> Hello {{ name }} </p>' })

		await manager.use().send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
			message.htmlView('welcome', { name: 'virk' })
		})

		assert.isUndefined(customDriver.message)
	})

	test('trap sendLater calls without hitting the queue', async (assert) => {
		assert.plan(2)

		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: any
			public options: any

			public async send(message: any, options: any) {
				this.message = message
				this.options = options
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		manager.trap((message) => {
			assert.deepEqual(message, {
				to: [{ address: 'foo@bar.com' }],
				from: { address: 'baz@bar.com' },
				subject: 'Hello world',
			})
		})

		manager.monitorQueue(() => {
			throw new Error('Never expected to reach here')
		})

		await manager.use().sendLater((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
		})

		assert.isUndefined(customDriver.message)
	})

	test('remove trap after restore', async (assert) => {
		assert.plan(2)

		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: any
			public options: any

			public async send(message: any, options: any) {
				this.message = message
				this.options = options
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		manager.trap((message) => {
			assert.deepEqual(message, {
				to: [{ address: 'foo@bar.com' }],
				from: { address: 'baz@bar.com' },
				subject: 'Hello world',
			})
		})

		await manager.use().send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
		})

		manager.restore()

		await manager.use().send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
		})

		assert.deepEqual(customDriver.message, {
			to: [{ address: 'foo@bar.com' }],
			from: { address: 'baz@bar.com' },
			subject: 'Hello world',
		})
	})

	test('trap multiple mail send calls', async (assert) => {
		assert.plan(3)

		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: any
			public options: any

			public async send(message: any, options: any) {
				this.message = message
				this.options = options
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		let i = 0

		manager.trap((message) => {
			i++
			if (i === 1) {
				assert.deepEqual(message, {
					to: [{ address: 'foo@bar.com' }],
					from: { address: 'baz@bar.com' },
					subject: 'Hello world',
				})
			}

			if (i === 2) {
				assert.deepEqual(message, {
					to: [{ address: 'foo@bar.com' }],
					from: { address: 'baz@bar.com' },
					subject: 'Hi world',
				})
			}
		})

		await manager.use().send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
		})

		await manager.use().send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hi world')
		})

		assert.isUndefined(customDriver.message)
	})

	test('trap when calling send on mail manager directly', async (assert) => {
		assert.plan(2)

		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: any
			public options: any

			public async send(message: any, options: any) {
				this.message = message
				this.options = options
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		manager.trap((message) => {
			assert.deepEqual(message, {
				to: [{ address: 'foo@bar.com' }],
				from: { address: 'baz@bar.com' },
				subject: 'Hello world',
			})
		})

		await manager.send((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
		})

		assert.isUndefined(customDriver.message)
	})
})

test.group('Mail Manager | preview', (group) => {
	test.skip('Mail.preview should return the preview url', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'smtp',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		const response = await manager.preview((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
		})

		assert.exists(response.url)
	}).timeout(1000 * 10)

	test.skip('multiple calls to preview should use one account', async (assert) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'smtp',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		const response = await manager.preview((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
		})

		const response1 = await manager.preview((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
		})

		assert.deepEqual(response.account, response1.account)
		assert.notEqual(response.url, response1.url)
	}).timeout(1000 * 10)
})

test.group('Mail Manager | queue', (group) => {
	test('pass mail and response to the queue monitor function', async (assert, done) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: any
			public options: any

			public async send(message: any, options: any) {
				return new Promise((resolve) => {
					setTimeout(() => {
						this.message = message
						this.options = options
						resolve({ messageId: '1' })
					}, 1000)
				})
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		manager.monitorQueue((error, response) => {
			assert.isNull(error)
			assert.equal(response?.mail.message.subject, 'Hello world')
			assert.equal(response?.response.messageId, '1')
			done()
		})

		await manager.use().sendLater((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
		})
	})

	test('attach mail to the queue error object', async (assert, done) => {
		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'custom',
				},
			},
		}

		class CustomDriver implements MailDriverContract {
			public message: any
			public options: any

			public async send(message: any, options: any) {
				return new Promise((_, reject) => {
					setTimeout(() => {
						this.message = message
						this.options = options
						reject(new Error('Something went wrong'))
					}, 1000)
				})
			}

			public async close() {}
		}

		const customDriver = new CustomDriver()
		const manager = new MailManager(config as any, console as any)

		manager.extend('custom', () => {
			return customDriver
		})

		manager.monitorQueue((error) => {
			assert.equal(error?.mail.message.subject, 'Hello world')
			assert.equal(error?.message, 'Something went wrong')
			done()
		})

		await manager.use().sendLater((message) => {
			message.to('foo@bar.com')
			message.from('baz@bar.com')
			message.subject('Hello world')
		})
	})
})
