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
	SparkPostConfig,
	SparkPostResponse,
	SparkPostRuntimeConfig,
	SparkPostDriverContract,
} from '@tensei/mail'

import { SparkPostTransport } from '../Transports/SparkPost'

/**
 * Ses driver to send email using ses
 */
export class SparkPostDriver implements SparkPostDriverContract {
	constructor(private config: SparkPostConfig, private logger: Config['logger']) {}

	/**
	 * Send message
	 */
	public async send(
		message: MessageNode,
		config?: SparkPostRuntimeConfig
	): Promise<SparkPostResponse> {
		const transporter = nodemailer.createTransport(
			new SparkPostTransport(
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
