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
	SmtpMailResponse,
	SmtpDriverContract,
} from '@tensei/mail'

/**
 * Smtp driver to send email using smtp
 */
export class EtherealDriver implements SmtpDriverContract {
    private transporter: any
    
    constructor(public config: any, public logger: Config['logger']) {}

    /**
	 * Creates and returns an ethereal email account. Node mailer internally
	 * ensures only a single email account is created and hence we don't
	 * have to worry about caching credentials.
	 */
	private getEtherealAccount(): Promise<any> {
		return new Promise((resolve, reject) => {
			nodemailer.createTestAccount((error: Error|null, account: any) => {
				if (error) {
					reject(error)
				} else {
					resolve(account)
				}
			})
		})
    }
    
    /**
	 * Creates an instance of `smtp` driver by lazy loading. This method
	 * is invoked internally when a new driver instance is required
	 */
	protected createTransport(account: any) {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: account.user,
                pass: account.pass
            }
        })
	}

	/**
	 * Send message
	 */
	public async send(message: MessageNode): Promise<SmtpMailResponse> {
        const account = await this.getEtherealAccount()

        this.createTransport(account)

        const mail = await this.transporter.sendMail(message)
    
        this.logger.info(
            nodemailer.getTestMessageUrl(await this.transporter.sendMail(message)) as string
        )

		return mail
    }

	/**
	 * Close transporter connection, helpful when using connections pool
	 */
	public async close() {
        if (this.transporter) {
            this.transporter.close()
        }

		this.transporter = null
	}
}
