/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { join } from 'path'
import dotenv from 'dotenv'

import { Message } from '../src/Message'
import { SesDriver } from '../src/drivers/Ses'

test.group('Ses Driver', (group) => {
	group.before(() => {
		dotenv.config({ path: join(__dirname, '..', '.env') })
	})

	test.skip('send email using ses driver', async (assert) => {
		const ses = new SesDriver({
			driver: 'ses',
			apiVersion: '2010-12-01',
			key: process.env.AWS_ACCESS_KEY_ID!,
			secret: process.env.AWS_SECRET_ACCESS_KEY!,
			region: process.env.AWS_REGION!,
			sslEnabled: true,
		})

		const message = new Message()
		message.from(process.env.FROM_EMAIL!)
		message.to('virk@adonisjs.com')
		message.cc('info@adonisjs.com')
		message.subject('Adonisv5')
		message.html('<p> Hello Adonis </p>')

		const response = await ses.send(message.toJSON().message)

		assert.exists(response.response)
		assert.exists(response.messageId)
		assert.equal(response.envelope!.from, process.env.FROM_EMAIL)
		assert.deepEqual(response.envelope!.to, ['virk@adonisjs.com', 'info@adonisjs.com'])
	}).timeout(1000 * 10)

	test.skip('define email tags', async (assert) => {
		assert.plan(1)

		const ses = new SesDriver({
			driver: 'ses',
			apiVersion: '2010-12-01',
			key: process.env.AWS_ACCESS_KEY_ID!,
			secret: process.env.AWS_SECRET_ACCESS_KEY!,
			region: process.env.AWS_REGION!,
			sslEnabled: true,
		})

		const message = new Message()
		message.from(process.env.FROM_EMAIL!)
		message.to('virk@adonisjs.com')
		message.cc('info@adonisjs.com')
		message.subject('Adonisv5')
		message.html('<p> Hello Adonis </p>')

		ses['transporter'].sendMail = function (mailMessage: any) {
			assert.deepEqual(mailMessage.ses, {
				Tags: [{ Name: 'foo', Value: 'bar' }],
			})
		}

		await ses.send(message.toJSON().message, {
			Tags: [{ Name: 'foo', Value: 'bar' }],
		})
	})
})
