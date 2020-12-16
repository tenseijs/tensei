/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../types/mail.ts" />

import nodemailer from 'nodemailer'
import {
	MessageNode,
	TrapCallback,
	FakeDriverContract,
	FakeMailResponse,
} from '@tensei/mail'

/**
 * Smtp driver to send email using smtp
 */
export class FakeDriver implements FakeDriverContract {
	private transporter: any

	constructor(private listener: TrapCallback) {
		this.transporter = nodemailer.createTransport({
			jsonTransport: true,
		})
	}

	/**
	 * Send message
	 */
	public async send(message: MessageNode): Promise<FakeMailResponse> {
		if (!this.transporter) {
			throw new Error('Driver transport has been closed and cannot be used for sending emails')
		}

		const listenerResponse = this.listener(message)
		const response = await this.transporter.sendMail(message)
		return { ...response, ...listenerResponse }
	}

	/**
	 * Close transporter connection, helpful when using connections pool
	 */
	public async close() {
		this.transporter.close()
		this.transporter = null
	}
}
