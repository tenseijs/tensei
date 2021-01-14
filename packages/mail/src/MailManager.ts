/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../types/mail.ts" />

import Path from 'path'
import fastq from 'fastq'
import { Edge } from 'edge.js'
import nodemailer from 'nodemailer'
import { Manager } from '@poppinss/manager'
import { Supercharged } from 'edge-supercharged'
import { ManagerConfigValidator } from '@poppinss/utils'

import {
	MailConfig,
	MailersList,
	TrapCallback,
	MailerContract,
	CompiledMailNode,
	MailDriverContract,
	QueueMonitorCallback,
	MailManagerContract,
	MessageComposeCallback,
} from '@tensei/mail'

import { Mailer } from './Mailer'
import { BaseMailer } from './base-mailer'
import { prettyPrint } from './helpers/prettyPrint'

import { Config } from '@tensei/common'
/**
 * The manager exposes the API to pull instance of [[Mailer]] class for pre-defined mappings
 * in the config file. The manager internally manages the state of mappings and cache
 * them for re-use.
 */
export class MailManager
	extends Manager<
		any,
		MailDriverContract,
		MailerContract<keyof MailersList>,
		{
			[P in keyof MailersList]: MailerContract<keyof MailersList>
		}
	>
	implements MailManagerContract {
	/**
	 * Caching driver instances. One must call `close` to clean it up
	 */
	protected singleton = true

	/**
	 * Reference to the fake driver
	 */
	private fakeMailer?: MailerContract<any>

	/**
	 * Method to pretty print sent emails
	 */
	public prettyPrint = prettyPrint

	/**
	 * Emails queue to scheduling emails to be delivered later
	 */
	private emailsQueue = fastq(this, this.sendQueuedEmail, 10)

	/**
	 * Method to monitor in-memory email queue
	 */
	private queueMonitor: QueueMonitorCallback = (error) => {
		if (error) {
			this.logger.error(
				{
					subject: error.mail.message.subject,
					message: error.message,
				},
				'Unable to deliver email'
			)
		}
	}

	/**
	 * Reference to the base mailer since Ioc container doesn't allow
	 * multiple exports
	 */
	public BaseMailer = BaseMailer

	/**
	 * We'll inject custom views and loggers in order to replace functionality
	 * coming from the Adonis framework.
	 */
	public view = {} as any

	constructor(private config: MailConfig, public logger: Config['logger'], private mailsPath?: string) {
		super({} as any)
		this.BaseMailer.mail = this
		this.setupViews()
		this.validateConfig()
	}

	public setConfig(config: MailConfig) {
		this.config = config

		return this
	}

	private setupViews() {
		const cacheViews = !!(process.env.CACHE_VIEWS || process.env.NODE_ENV === 'production')

		const edge = new Edge({
			cache: cacheViews,
		})
		const supercharged = new Supercharged()

		edge.mount(
			 this.mailsPath || Path.resolve(process.cwd(), 'mails')
		)

		edge.use(supercharged.wire, { recurring: !cacheViews })

		this.view = edge
	}

	/**
	 * Validate config at runtime
	 */
	private validateConfig() {
		const validator = new ManagerConfigValidator(this.config, 'mail', 'config/mail')
		validator.validateDefault('mailer')
		validator.validateList('mailers', 'mailer')
	}

	/**
	 * Sends the email by pulling it from the queue. This method is invoked
	 * automatically by fastq.
	 */
	private async sendQueuedEmail(
		mail: CompiledMailNode,
		cb: (error: null | any, response?: any) => void
	) {
		try {
			const response = await this.use(mail.mailer).sendCompiled(mail)
			cb(null, { mail, response })
		} catch (error) {
			error.mail = mail
			cb(error)
		}
	}

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
	 * Since we don't expose the drivers instances directly, we wrap them
	 * inside the mailer instance.
	 */
	protected wrapDriverResponse<Name extends keyof MailersList>(
		mappingName: Name,
		driver: MailDriverContract
	): MailerContract<Name> {
		return new Mailer(mappingName, this, true, driver)
	}

	/**
	 * Returns the driver name for a given mapping
	 */
	protected getMappingDriver(name: string) {
		const config = this.getMappingConfig(name)
		return config && config.driver
	}

	/**
	 * Returns the config for a given mapping
	 */
	protected getMappingConfig(name: string) {
		return (this.config.mailers as any)[name]
	}

	/**
	 * Returns the name of the default mapping
	 */
	protected getDefaultMappingName() {
		return this.config.mailer
	}

	/**
	 * Creates an instance of `smtp` driver by lazy loading. This method
	 * is invoked internally when a new driver instance is required
	 */
	protected createSmtp(_: string, config: any) {
		const { SmtpDriver } = require('./drivers/Smtp')
		return new SmtpDriver(config)
	}

	/**
	 * Creates an instance of `ethereal` driver by lazy loading. This method
	 * is invoked internally when a new driver instance is required
	 */
	protected createEthereal(_: string, config: any) {
		const { EtherealDriver } = require('./drivers/Ethereal')
		return new EtherealDriver(config, this.logger)
	}

	protected createFake(_: string, config: any) {
		const { FakeDriver } = require('./drivers/Fake')
		return new FakeDriver(config, this.logger)
	}

	/**
	 * Creates an instance of `mailgun` driver by lazy loading. This method
	 * is invoked internally when a new driver instance is required
	 */
	protected createMailgun(_: string, config: any) {
		const { MailgunDriver } = require('./drivers/Mailgun')
		return new MailgunDriver(config, this.logger)
	}

	/**
	 * Creates an instance of `sparkpost` driver by lazy loading. This method
	 * is invoked internally when a new driver instance is required
	 */
	protected createSparkpost(_: string, config: any) {
		const { SparkPostDriver } = require('./drivers/Sparkpost')
		return new SparkPostDriver(config, this.logger)
	}

	/**
	 * Method to schedule email for sending. This method is invoked by
	 * the mailer when `sendLater` method is called
	 */
	public scheduleEmail(mail: CompiledMailNode) {
		this.emailsQueue.push(mail, this.queueMonitor as any)
	}

	/**
	 * Fake email calls. The "sendLater" emails will be invoked right
	 * away as well
	 */
	public trap(callback: TrapCallback) {
		const { FakeDriver } = require('./drivers/Fake')
		this.fakeMailer = new Mailer('fake' as any, this, false, new FakeDriver(callback))
	}

	/**
	 * Define a callback to monitor emails queue
	 */
	public monitorQueue(callback: QueueMonitorCallback): void {
		this.queueMonitor = callback
	}

	/**
	 * Restore previously created trap.
	 */
	public restore() {
		this.fakeMailer = undefined
	}

	/**
	 * Sends email using the default `mailer`
	 */
	public async send(callback: MessageComposeCallback) {
		if (this.fakeMailer) {
			return this.fakeMailer.send(callback)
		}
		return this.use().send(callback)
	}

	/**
	 * Send email by pushing it to the in-memory queue
	 */
	public async sendLater(callback: MessageComposeCallback) {
		if (this.fakeMailer) {
			return this.fakeMailer.sendLater(callback)
		}
		return this.use().sendLater(callback)
	}

	/**
	 * Use a named or the default mailer
	 */
	public use(name?: keyof MailersList) {
		if (this.fakeMailer) {
			return this.fakeMailer
		}

		return name ? super.use(name) : super.use()
	}

	/**
	 * Closes the mapping instance and removes it from the cache
	 */
	public async close(name?: keyof MailersList): Promise<void> {
		const mailer = name ? this.use(name) : this.use()
		await mailer.close()
	}

	/**
	 * Closes the mapping instance and removes it from the cache
	 */
	public async closeAll(): Promise<void> {
		await Promise.all(
			Array.from(this['mappingsCache'].keys()).map((name: unknown) => this.close(name as any))
		)
	}

	/**
	 * Sends email to the ethereal email account. This is great
	 * for previewing emails
	 */
	public async preview(callback: MessageComposeCallback) {
		const account = await this.getEtherealAccount()
		const mappingName: any = 'ethereal'

		const smtpDriver = this.createSmtp(mappingName, {
			host: account.smtp.host,
			port: account.smtp.port,
			secure: account.smtp.secure,
			auth: {
				user: account.user,
				pass: account.pass,
			},
		})

		const mailer = this.wrapDriverResponse(mappingName, smtpDriver)
		const response = await mailer.send(callback)

		return {
			...response,
			url: nodemailer.getTestMessageUrl(response),
			account: {
				user: account.user,
				pass: account.pass,
			},
		}
	}
}
