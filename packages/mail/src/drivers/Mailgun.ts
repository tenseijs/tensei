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
import { Config } from '@tensei/common'

import {
	MessageNode,
	MailgunConfig,
	MailgunResponse,
	MailgunRuntimeConfig,
	MailgunDriverContract,
} from '@tensei/mail'

import { MailgunTransport } from '../transports-xo/Mailgun'

/**
 * Ses driver to send email using ses
 */
export class MailgunDriver implements MailgunDriverContract {
	constructor(private config: MailgunConfig, private logger: Config['logger']) {}

	/**
	 * Send message
	 */
	public async send(message: MessageNode, config?: MailgunRuntimeConfig): Promise<MailgunResponse> {
		const transporter = nodemailer.createTransport(
			new MailgunTransport(
				{
					...this.config,
					...config,
				},
				this.logger
			)
		)

		return transporter.sendMail(message as any)
	}

	public async close() {}
}
