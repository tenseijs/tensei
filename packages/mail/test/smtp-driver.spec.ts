/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import dotenv from 'dotenv'
import { join } from 'path'

import { Message } from '../src/Message'
import { SmtpDriver } from '../src/Drivers/Smtp'

test.group('Smtp Driver', (group) => {
	group.before(() => {
		dotenv.config({ path: join(__dirname, '..', '.env') })
	})

	test.skip('send email using smtp driver', async (assert) => {
		const smtp = new SmtpDriver({
			driver: 'smtp',
			host: process.env.MAILTRAP_SMTP_HOST!,
			auth: {
				type: 'login' as const,
				user: process.env.MAILTRAP_USERNAME!,
				pass: process.env.MAILTRAP_PASSWORD!,
			},
		})

		const message = new Message()
		message.from(process.env.MAILTRAP_EMAIL!)
		message.to('virk@adonisjs.com')
		message.cc('info@adonisjs.com')
		message.subject('Adonisv5')
		message.html('<p> Hello Adonis </p>')

		const response = await smtp.send(message.toJSON().message)

		assert.exists(response.response)
		assert.exists(response.messageId)
		assert.equal(response.envelope!.from, process.env.MAILTRAP_EMAIL!)
		assert.deepEqual(response.envelope!.to, ['virk@adonisjs.com', 'info@adonisjs.com'])
	}).timeout(1000 * 10)
})
