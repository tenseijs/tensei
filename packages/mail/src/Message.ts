/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../types/mail.ts" />

import { Readable } from 'stream'
import {
	EnvolpeNode,
	MessageNode,
	MessageContract,
	AttachmentOptionsNode,
	MessageContentViewsNode,
} from '@tensei/mail'

/**
 * Fluent API to construct node mailer message object
 */
export class Message implements MessageContract {
	private nodeMailerMessage: MessageNode = {}
	constructor(private deferred: boolean = false) {}

	/**
	 * Path to the views used to generate content for the
	 * message
	 */
	contentViews: {
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
	} = {}

	/**
	 * Returns address node with correctly formatted way
	 */
	private getAddress(address: string, name?: string): { address: string; name?: string } {
		return name ? { address, name } : { address }
	}

	/**
	 * Add receipent as `to`
	 */
	public to(address: string, name?: string): this {
		this.nodeMailerMessage.to = this.nodeMailerMessage.to || []
		this.nodeMailerMessage.to.push(this.getAddress(address, name))
		return this
	}

	/**
	 * Add `from` name and email
	 */
	public from(address: string, name?: string): this {
		this.nodeMailerMessage.from = this.getAddress(address, name)
		return this
	}

	/**
	 * Add receipent as `cc`
	 */
	public cc(address: string, name?: string): this {
		this.nodeMailerMessage.cc = this.nodeMailerMessage.cc || []
		this.nodeMailerMessage.cc.push(this.getAddress(address, name))
		return this
	}

	/**
	 * Add receipent as `bcc`
	 */
	public bcc(address: string, name?: string): this {
		this.nodeMailerMessage.bcc = this.nodeMailerMessage.bcc || []
		this.nodeMailerMessage.bcc.push(this.getAddress(address, name))
		return this
	}

	/**
	 * Define custom message id
	 */
	public messageId(messageId: string): this {
		this.nodeMailerMessage.messageId = messageId
		return this
	}

	/**
	 * Define subject
	 */
	public subject(message: string): this {
		this.nodeMailerMessage.subject = message
		return this
	}

	/**
	 * Define replyTo email and name
	 */
	public replyTo(address: string, name?: string): this {
		this.nodeMailerMessage.replyTo = this.getAddress(address, name)
		return this
	}

	/**
	 * Define inReplyTo message id
	 */
	public inReplyTo(messageId: string): this {
		this.nodeMailerMessage.inReplyTo = messageId
		return this
	}

	/**
	 * Define multiple message id's as references
	 */
	public references(messagesIds: string[]): this {
		this.nodeMailerMessage.references = messagesIds
		return this
	}

	/**
	 * Optionally define email envolpe
	 */
	public envelope(envelope: EnvolpeNode): this {
		this.nodeMailerMessage.envelope = envelope
		return this
	}

	/**
	 * Define contents encoding
	 */
	public encoding(encoding: string): this {
		this.nodeMailerMessage.encoding = encoding
		return this
	}

	/**
	 * Define email prority
	 */
	public priority(priority: 'low' | 'normal' | 'high'): this {
		this.nodeMailerMessage.priority = priority
		return this
	}

	/**
	 * Compute email html from defined view
	 */
	public htmlView(template: string, data?: any): this {
		this.contentViews.html = { template, data }
		return this
	}

	/**
	 * Compute email text from defined view
	 */
	public textView(template: string, data?: any): this {
		this.contentViews.text = { template, data }
		return this
	}

	/**
	 * Compute apple watch html from defined view
	 */
	public watchView(template: string, data?: any): this {
		this.contentViews.watch = { template, data }
		return this
	}

	/**
	 * Compute email html from raw text
	 */
	public html(content: string): this {
		this.nodeMailerMessage.html = content
		return this
	}

	/**
	 * Compute email text from raw text
	 */
	public text(content: string): this {
		this.nodeMailerMessage.text = content
		return this
	}

	/**
	 * Compute email watch html from raw text
	 */
	public watch(content: string): this {
		this.nodeMailerMessage.watch = content
		return this
	}

	/**
	 * Define one or attachments
	 */
	public attach(filePath: string, options?: AttachmentOptionsNode): this {
		this.nodeMailerMessage.attachments = this.nodeMailerMessage.attachments || []
		this.nodeMailerMessage.attachments.push({
			path: filePath,
			...options,
		})

		return this
	}

	/**
	 * Define attachment from raw data
	 */
	public attachData(content: Readable | Buffer, options?: AttachmentOptionsNode): this {
		if (this.deferred) {
			throw new Error('Cannot attach raw data when using "Mail.sendLater" method')
		}

		this.nodeMailerMessage.attachments = this.nodeMailerMessage.attachments || []
		this.nodeMailerMessage.attachments.push({
			content,
			...options,
		})

		return this
	}

	/**
	 * Embed attachment inside content using `cid`
	 */
	public embed(filePath: string, cid: string, options?: AttachmentOptionsNode): this {
		this.nodeMailerMessage.attachments = this.nodeMailerMessage.attachments || []
		this.nodeMailerMessage.attachments.push({
			path: filePath,
			cid,
			...options,
		})

		return this
	}

	/**
	 * Embed attachment from raw data inside content using `cid`
	 */
	public embedData(content: Readable | Buffer, cid: string, options?: AttachmentOptionsNode): this {
		if (this.deferred) {
			throw new Error('Cannot attach raw data when using "Mail.sendLater" method')
		}

		this.nodeMailerMessage.attachments = this.nodeMailerMessage.attachments || []
		this.nodeMailerMessage.attachments.push({
			content,
			cid,
			...options,
		})

		return this
	}

	/**
	 * Define custom headers for email
	 */
	public header(key: string, value: string | string[]): this {
		this.nodeMailerMessage.headers = this.nodeMailerMessage.headers || []
		this.nodeMailerMessage.headers.push({ [key]: value })

		return this
	}

	/**
	 * Define custom prepared headers for email
	 */
	public preparedHeader(key: string, value: string | string[]): this {
		this.nodeMailerMessage.headers = this.nodeMailerMessage.headers || []
		this.nodeMailerMessage.headers.push({ [key]: { prepared: true, value } })

		return this
	}

	/**
	 * Get message JSON. The packet can be sent over to nodemailer
	 */
	public toJSON(): { message: MessageNode; views: MessageContentViewsNode } {
		return {
			message: this.nodeMailerMessage,
			views: this.contentViews,
		}
	}
}
