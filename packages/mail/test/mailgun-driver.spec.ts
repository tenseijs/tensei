/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import got from 'got'
import test from 'japa'
import dotenv from 'dotenv'
import { join } from 'path'

import { Message } from '../src/message'
import { MailgunDriver } from '../src/drivers/Mailgun'

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time))

test.group('Mailgun Driver', (group) => {
	group.before(() => {
		dotenv.config({ path: join(__dirname, '..', '.env') })
	})

	test.skip('send email using mailgun driver', async (assert) => {
		const mailgun = new MailgunDriver(
			{
				driver: 'mailgun',
				key: process.env.MAILGUN_ACCESS_KEY!,
				baseUrl: 'https://api.mailgun.net/v3',
				domain: 'adonisjs.com',
			},
			console as any
		)

		const message = new Message()
		message.from(process.env.FROM_EMAIL!)
		message.to('virk@adonisjs.com')
		message.cc('info@adonisjs.com')
		message.subject('Adonisv5')
		message.html('<p> Hello Adonis </p>')

		const response = await mailgun.send(message.toJSON().message)
		assert.exists(response.messageId)
		assert.equal(response.envelope!.from, process.env.FROM_EMAIL)
		assert.deepEqual(response.envelope!.to, ['virk@adonisjs.com', 'info@adonisjs.com'])
	}).timeout(1000 * 10)

	test.skip('enable tracking', async (assert) => {
		const mailgun = new MailgunDriver(
			{
				driver: 'mailgun',
				key: process.env.MAILGUN_ACCESS_KEY!,
				baseUrl: process.env.MAILGUN_BASE_URL!,
				domain: 'adonisjs.com',
				oTracking: true,
			},
			console as any
		)

		const message = new Message()
		message.from(process.env.FROM_EMAIL!)
		message.to('virk@adonisjs.com')
		message.cc('info@adonisjs.com')
		message.subject('Adonisv5')
		message.html('<p> Hello Adonis </p>')

		const response = await mailgun.send(message.toJSON().message)
		assert.exists(response.messageId)
		assert.equal(response.envelope!.from, process.env.FROM_EMAIL)
		assert.deepEqual(response.envelope!.to, ['virk@adonisjs.com', 'info@adonisjs.com'])
	}).timeout(1000 * 10)

	test.skip('attach tags', async (assert) => {
		const mailgun = new MailgunDriver(
			{
				driver: 'mailgun',
				key: process.env.MAILGUN_ACCESS_KEY!,
				baseUrl: 'https://api.mailgun.net/v3',
				domain: 'adonisjs.com',
			},
			console as any
		)

		const message = new Message()
		message.from(process.env.FROM_EMAIL!)
		message.to('virk@adonisjs.com')
		message.cc('info@adonisjs.com')
		message.subject('Adonisv5')
		message.html('<p> Hello Adonis </p>')

		const response = await mailgun.send(message.toJSON().message, {
			oTags: ['newsletter', 'test'],
		})
		assert.exists(response.messageId)
		assert.equal(response.envelope!.from, process.env.FROM_EMAIL)
		assert.deepEqual(response.envelope!.to, ['virk@adonisjs.com', 'info@adonisjs.com'])

		await sleep(4000)

		const { body } = await got.get<{ items: any }>(
			`${process.env.MAILGUN_BASE_URL}/adonisjs.com/events?message-id=${response.messageId}`,
			{
				responseType: 'json',
				username: 'api',
				password: process.env.MAILGUN_ACCESS_KEY,
			}
		)

		assert.deepEqual(body.items[0].tags, ['test', 'newsletter'])
	})
		.timeout(1000 * 10)
		.retry(2)
})
