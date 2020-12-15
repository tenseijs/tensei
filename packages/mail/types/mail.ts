/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@tensei/mail' {
	import { TlsOptions } from 'tls'
	import { SES } from 'aws-sdk'
	import { Readable } from 'stream'
	import { ManagerContract } from '@poppinss/manager'

	/*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

	/**
	 * Unwraps value of a promise type
	 */
	export type UnwrapPromise<T> = T extends PromiseLike<infer U> ? U : T

	/**
	 * Infers the response type of a driver
	 */
	export type DriverResponseType<Driver> = Driver extends MailDriverContract
		? UnwrapPromise<ReturnType<Driver['send']>>
		: never

	/**
	 * Infers the response type of a mailer
	 */
	export type MailerResponseType<Name extends keyof MailersList> = DriverResponseType<
		MailersList[Name]['implementation']
	>

	/**
	 * Infers the 2nd argument accepted by the driver send method
	 */
	export type DriverOptionsType<Driver> = Driver extends MailDriverContract
		? Parameters<Driver['send']>[1]
		: never

	/*
  |--------------------------------------------------------------------------
  | Message
  |--------------------------------------------------------------------------
  */

	/**
	 * Attachment options
	 */
	export type AttachmentOptionsNode = {
		filename?: string
		href?: string
		httpHeaders?: { [key: string]: any }
		contentType?: string
		contentDisposition?: string
		encoding?: string
		headers?: { [key: string]: any }
	}

	/**
	 * Shape of envolpe
	 */
	export type EnvolpeNode = { from?: string; to?: string; cc?: string; bcc?: string }
	export type PostSentEnvolpeNode = { from: string; to: string[] }

	/**
	 * Shape of the recipient
	 */
	export type RecipientNode = { address: string; name?: string }

	/**
	 * Shape of data view defined on the message
	 */
	export type MessageContentViewsNode = {
		html?: {
			template: string
			data?: any
		}
		text?: {
			template: string
			data?: any
		}
		watch?: {
			template: string
			data?: any
		}
	}

	/**
	 * Message node is compatible with nodemailer `sendMail` method
	 */
	export type MessageNode = {
		from?: RecipientNode
		to?: RecipientNode[]
		cc?: RecipientNode[]
		bcc?: RecipientNode[]
		messageId?: string
		subject?: string
		replyTo?: RecipientNode
		inReplyTo?: string
		references?: string[]
		encoding?: string
		priority?: 'low' | 'normal' | 'high'
		envelope?: EnvolpeNode
		attachments?: (AttachmentOptionsNode & {
			path?: string
			cid?: string
			content?: Buffer | Readable
		})[]
		headers?: (
			| {
					[key: string]: string | string[]
			  }
			| {
					[key: string]: { prepared: true; value: string | string[] }
			  }
		)[]
		html?: string
		text?: string
		watch?: string
	}

	/**
	 * Shape of the message instance passed to `send` method callback
	 */
	export interface MessageContract {
		/**
		 * Common fields
		 */
		to(address: string, name?: string): this
		from(address: string, name?: string): this
		cc(address: string, name?: string): this
		bcc(address: string, name?: string): this
		messageId(messageId: string): this
		subject(message: string): this

		/**
		 * Routing options
		 */
		replyTo(address: string, name?: string): this
		inReplyTo(messageId: string): this
		references(messagesIds: string[]): this
		envelope(envelope: EnvolpeNode): this
		priority(priority: 'low' | 'normal' | 'high'): this

		/**
		 * Content options
		 */
		encoding(encoding: string): this
		htmlView(template: string, data?: any): this
		textView(template: string, data?: any): this
		watchView(template: string, data?: any): this
		html(content: string): this
		text(content: string): this
		watch(content: string): this

		/**
		 * Attachments
		 */
		attach(filePath: string, options: AttachmentOptionsNode): this
		attachData(content: Readable | Buffer, options: AttachmentOptionsNode): this
		embed(filePath: string, cid: string, options: AttachmentOptionsNode): this
		embedData(content: Readable | Buffer, cid: string, options: AttachmentOptionsNode): this

		header(key: string, value: string | string[]): this
		preparedHeader(key: string, value: string | string[]): this

		toJSON(): {
			message: MessageNode
			views: MessageContentViewsNode
		}
	}

	/*
  |--------------------------------------------------------------------------
  | Drivers Interface
  |--------------------------------------------------------------------------
  */

	/**
	 * Shape of the driver contract. Each driver must adhere to
	 * this interface
	 */
	export interface MailDriverContract {
		send(message: MessageNode, config?: any): Promise<any>
		close(): void | Promise<void>
	}

	/*
  |--------------------------------------------------------------------------
  | Config Helpers
  |--------------------------------------------------------------------------
  */

	/**
	 * A shortcut to define `config` and `implementation` keys on the
	 * `MailersList` interface. Using this type is not mandatory and
	 * one can define the underlying keys by themselves.
	 * For example:
	 *
	 * ```
	 * MailersList: {
	 *   transactional: {
	 *     config: SmtpConfig,
	 *     implementation: SmtpDriverContract,
	 *   }
	 * }
	 * ```
	 *
	 * The shortcut is
	 *
	 * ```
	 * MailersList: {
	 *   transactional: MailDrivers['smtp']
	 * }
	 * ```
	 */
	export type MailDrivers = {
		smtp: {
			config: SmtpConfig
			implementation: SmtpDriverContract
		}
		ses: {
			config: SesConfig
			implementation: SesDriverContract
		}
		mailgun: {
			config: MailgunConfig
			implementation: MailgunDriverContract
		}
		sparkpost: {
			config: SparkPostConfig
			implementation: SparkPostDriverContract
		}
	}

	/**
	 * Using declaration merging, one must extend this interface.
	 * --------------------------------------------------------
	 * MUST BE SET IN THE USER LAND.
	 * --------------------------------------------------------
	 */
	export interface MailersList {}

	/*
  |--------------------------------------------------------------------------
  | Mailer Config
  |--------------------------------------------------------------------------
  */

	/**
	 * Shape of the mailer config computed from the `MailersList` interface.
	 * The `MailersList` is extended in the user codebase.
	 */
	export type MailConfig = {
		mailer: keyof MailersList
		mailers: { [P in keyof MailersList]: MailersList[P]['config'] }
	}

	/*
  |--------------------------------------------------------------------------
  | SMTP driver
  |--------------------------------------------------------------------------
  */

	/**
	 * Login options for Oauth2 smtp login
	 */
	export type SmtpOauth2 = {
		type: 'OAuth2'
		user: string
		clientId: string
		clientSecret: string
		refreshToken?: string
		accessToken?: string
		expires?: string | number
		accessUrl?: string
	}

	/**
	 * Login options for simple smtp login
	 */
	export type SmtpSimpleAuth = {
		type: 'login'
		user: string
		pass: string
	}

	/**
	 * Smtp driver config
	 */
	export type SmtpConfig = {
		host: string
		driver: 'smtp'
		port?: number | string
		secure?: boolean

		/**
		 * Authentication
		 */
		auth?: SmtpSimpleAuth | SmtpOauth2

		/**
		 * TLS options
		 */
		tls?: TlsOptions
		ignoreTLS?: boolean
		requireTLS?: boolean

		/**
		 * Pool options
		 */
		pool?: boolean
		maxConnections?: number
		maxMessages?: number
		rateDelta?: number
		rateLimit?: number

		/**
		 * Proxy
		 */
		proxy?: string
	}

	/**
	 * Shape of mail response for the smtp driver
	 */
	export type SmtpMailResponse = {
		response: string
		accepted: string[]
		rejected: string[]
		envelope: PostSentEnvolpeNode
		messageId: string
	}

	/**
	 * Shape of the smtp driver
	 */
	export interface SmtpDriverContract extends MailDriverContract {
		send(message: MessageNode, config?: any): Promise<SmtpMailResponse>
	}

	/*
  |--------------------------------------------------------------------------
  | SES driver
  |--------------------------------------------------------------------------
  */

	/**
	 * Ses driver config
	 */
	export type SesConfig = {
		driver: 'ses'
		apiVersion: string
		key: string
		secret: string
		region: string
		sslEnabled?: boolean
		sendingRate?: number
		maxConnections?: number
	}

	/**
	 * Shape of mail response for the ses driver
	 */
	export type SesMailResponse = {
		response: string
		accepted: string[]
		rejected: string[]
		envelope: PostSentEnvolpeNode
		messageId: string
	}

	/**
	 * Shape of the ses driver
	 */
	export interface SesDriverContract extends MailDriverContract {
		send(
			message: MessageNode,
			options?: Omit<SES.Types.SendRawEmailRequest, 'RawMessage' | 'Source' | 'Destinations'>
		): Promise<SesMailResponse>
	}

	/*
  |--------------------------------------------------------------------------
  | Mailgun driver
  |--------------------------------------------------------------------------
  */

	/**
	 * Mailgun driver config
	 */
	export type MailgunRuntimeConfig = {
		oTags?: string[]
		oDeliverytime?: Date
		oTestMode?: boolean
		oTracking?: boolean
		oTrackingClick?: boolean
		oTrackingOpens?: boolean
		headers?: { [key: string]: string }
	}

	export type MailgunConfig = MailgunRuntimeConfig & {
		driver: 'mailgun'
		baseUrl: string
		key: string
		domain?: string
		oDkim?: boolean
	}

	/**
	 * Shape of mail response for the mailgun driver
	 */
	export type MailgunResponse = {
		envelope: PostSentEnvolpeNode
		messageId: string
	}

	/**
	 * Shape of the mailgun driver
	 */
	export interface MailgunDriverContract extends MailDriverContract {
		send(message: MessageNode, config?: MailgunRuntimeConfig): Promise<MailgunResponse>
	}

	/*
	|--------------------------------------------------------------------------
	| SparkPost Driver
	|--------------------------------------------------------------------------
	*/

	/**
	 * Following options can be defined during the `Mail.send` call
	 */
	export type SparkPostRuntimeConfig = {
		startTime?: Date
		openTracking?: boolean
		clickTracking?: boolean
		transactional?: boolean
		sandbox?: boolean
		skipSuppression?: boolean
		ipPool?: string
	}

	/**
	 * Spark post config
	 */
	export type SparkPostConfig = SparkPostRuntimeConfig & {
		driver: 'sparkpost'
		baseUrl: string
		key: string
	}

	/**
	 * Shape of mail response for the sparkpost driver
	 */
	export type SparkPostResponse = {
		envelope: PostSentEnvolpeNode
		messageId: string
	}

	/**
	 * Shape of the sparkpost driver
	 */
	export interface SparkPostDriverContract extends MailDriverContract {
		send(message: MessageNode, config?: SparkPostRuntimeConfig): Promise<SparkPostResponse>
	}

	/*
  |--------------------------------------------------------------------------
  | Fake driver
  |--------------------------------------------------------------------------
  */

	/**
	 * Shape of mail response for the fake driver
	 */
	export type FakeMailResponse = {
		messageId: string
		message: MessageNode
		envelope: PostSentEnvolpeNode
	}

	/**
	 * Shape of the faker driver
	 */
	export interface FakeDriverContract extends MailDriverContract {
		send(message: MessageNode): Promise<FakeMailResponse>
	}

	/*
  |--------------------------------------------------------------------------
  | Mailer & Manager
  |--------------------------------------------------------------------------
  */

	/**
	 * Shape of the callback passed to the `send` method to compose the
	 * message
	 */
	export type MessageComposeCallback = (message: MessageContract) => void | Promise<void>

	/**
	 * Callback to wrap emails
	 */
	export type TrapCallback = (message: MessageNode) => any

	/**
	 * Callback to monitor queues response
	 */
	export type QueueMonitorCallback = (
		error?: Error & { mail: CompiledMailNode },
		response?: {
			mail: CompiledMailNode
			response: MailerResponseType<keyof MailersList>
		}
	) => void

	/**
	 * Shape of the compiled mail.
	 */
	export type CompiledMailNode = {
		message: MessageNode
		views: MessageContentViewsNode
		mailer: keyof MailersList
		config?: any
	}

	/**
	 * Packet emitted by the `adonis:mail:sent` event
	 */
	export type MailEventData = {
		message: MessageNode
		views: string[]
		mailer: keyof MailersList | 'fake' | 'ethereal'
		response: MailerResponseType<keyof MailersList>
	}

	/**
	 * Mailer exposes the unified API to send emails by using a given
	 * driver
	 */
	export interface MailerContract<Name extends keyof MailersList> {
		/**
		 * Mailer name
		 */
		readonly name: Name

		/**
		 * The driver in use
		 */
		readonly driver: MailersList[Name]['implementation']

		/**
		 * Sends email using a pre-compiled message. You should use [[MailerContract.send]]
		 * or [[MailerContract.sendLater]], unless you are pre-compiling messages
		 * yourself.
		 */
		sendCompiled(mail: CompiledMailNode): Promise<MailerResponseType<Name>>

		/**
		 * Define options to the passed to the mail driver send method
		 */
		options(options: DriverOptionsType<MailersList[Name]['implementation']>): this

		/**
		 * Send email
		 */
		send(
			callback: MessageComposeCallback,
			config?: DriverOptionsType<MailersList[Name]['implementation']>
		): Promise<MailerResponseType<Name>>

		/**
		 * Send email by pushing it to the in-memory queue
		 */
		sendLater(
			callback: MessageComposeCallback,
			config?: DriverOptionsType<MailersList[Name]['implementation']>
		): Promise<void>

		/**
		 * Close mailer
		 */
		close(): Promise<void>
	}

	/**
	 * Shape of the mailer
	 */
	export interface MailManagerContract
		extends ManagerContract<
			any,
			MailDriverContract,
			MailerContract<keyof MailersList>,
			{ [P in keyof MailersList]: MailerContract<P> }
		> {
		/**
		 * Trap emails
		 */
		trap(callback: TrapCallback): void

		/**
		 * Define a callback to monitor queued emails
		 */
		monitorQueue(callback: QueueMonitorCallback): void

		/**
		 * Restore trap
		 */
		restore(): void

		/**
		 * Pretty print mailer event data
		 */
		prettyPrint: (mail: MailEventData) => void

		/**
		 * Send email using the default mailer
		 */
		send(callback: MessageComposeCallback): ReturnType<MailDriverContract['send']>

		/**
		 * Send email by pushing it to the in-memory queue
		 */
		sendLater(callback: MessageComposeCallback): Promise<void>

		/**
		 * Preview email using ethereal.email
		 */
		preview(
			callback: MessageComposeCallback
		): Promise<SmtpMailResponse & { url: string; account: { user: string; pass: string } }>

		/**
		 * Close mailer
		 */
		close(name?: string): Promise<void>

		/**
		 * Close all mailers
		 */
		closeAll(): Promise<void>
	}

	/**
	 * Base mailer
	 */
	export interface BaseMailerContract<Mailer extends keyof MailersList> {
		/**
		 * Reference to the mailer. Assigned inside the service provider
		 */
		mail: MailManagerContract

		/**
		 * An optional method to use a custom mailer and its options
		 */
		mailer?: MailerContract<Mailer>

		/**
		 * Prepare mail message
		 */
		prepare(message: MessageContract): Promise<any> | any

		/**
		 * Preview email
		 */
		preview(): Promise<SmtpMailResponse & { url: string; account: { user: string; pass: string } }>

		/**
		 * Send email
		 */
		send(): Promise<MailerResponseType<Mailer>>

		/**
		 * Send email by pushing it to the in-memory queue
		 */
		sendLater(): Promise<void>
	}

	export const BaseMailer: {
		mail: MailManagerContract
		new <Mailer extends keyof MailersList = keyof MailersList>(
			...args: any[]
		): BaseMailerContract<Mailer>
	}
	const Mail: MailManagerContract
	export const mail: (config: MailConfig) => MailManagerContract
	export default Mail

}
