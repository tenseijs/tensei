/*
 * @adonisjs
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { MessageContract, BaseMailer as BaseMailerContract } from '@tensei/mail'

import { Message } from '../src/message'
import { MailManager } from '../src/MailManager'
import { BaseMailer as BaseMailerClass } from '../src/base-mailer'

const BaseMailer = (BaseMailerClass as unknown) as typeof BaseMailerContract

test.group('BaseMailer', (group) => {
	test('send email using the mailer class', async (assert) => {
		assert.plan(1)

		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'smtp',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		BaseMailer.mail = manager

		class MyMailer extends BaseMailer {
			public prepare(message: MessageContract) {
				message.subject('Welcome').to('virk@adonisjs.com').from('virk@adonisjs.com')
			}
		}

		manager.trap((message) => {
			assert.deepEqual(message, {
				subject: 'Welcome',
				from: { address: 'virk@adonisjs.com' },
				to: [{ address: 'virk@adonisjs.com' }],
			})
		})

		const mailer = new MyMailer()
		await mailer.send()
	})

	test('use a custom mailer', async (assert) => {
		assert.plan(1)

		const config = {
			mailer: 'marketing',
			mailers: {
				marketing: {
					driver: 'smtp',
				},
				transactional: {
					driver: 'ses',
				},
			},
		}

		const manager = new MailManager(config as any, console as any)
		BaseMailer.mail = manager

		class MyMailer extends BaseMailer<'transactional'> {
			public mailer = this.mail.use('transactional').options({
				FromArn: 'foo',
			})

			public prepare(message: MessageContract) {
				message.subject('Welcome').to('virk@adonisjs.com').from('virk@adonisjs.com')
			}
		}

		const mailer = new MyMailer()
		mailer.mailer.send = async function send(callback: any): Promise<any> {
			const message = new Message(false)
			await callback(message)

			assert.deepEqual(message.toJSON().message, {
				subject: 'Welcome',
				from: { address: 'virk@adonisjs.com' },
				to: [{ address: 'virk@adonisjs.com' }],
			})
		}

		await mailer.send()
	})
})
