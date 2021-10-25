/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import got from 'got'

import { Config } from '@tensei/common'
import { MailgunConfig } from '@tensei/mail'

import { ObjectBuilder } from '../utils'
import { EmailTransportException } from '../exceptions/EmailTransportException'

/**
 * Mailgun transport for node mailer. Uses the `/message.mime` to send MIME
 * representation of the email
 */
export class MailgunTransport {
  public name = 'mailgun'
  public version = '1.0.0'

  constructor(
    private config: MailgunConfig,
    private logger: Config['logger']
  ) {}

  /**
   * Converts a boolean flag to a yes/no string.
   */
  private flagToYesNo(value?: boolean) {
    if (value === undefined) {
      return
    }
    return value === true ? 'yes' : 'no'
  }

  /**
   * Returns pre-configured otags
   */
  private getOTags(config: MailgunConfig) {
    const tags = new ObjectBuilder()
    tags.add('o:tag', config.oTags)
    tags.add('o:dkim', this.flagToYesNo(config.oDkim))
    tags.add('o:testmode', this.flagToYesNo(config.oTestMode))
    tags.add('o:tracking', this.flagToYesNo(config.oTracking))
    tags.add('o:tracking-clicks', this.flagToYesNo(config.oTrackingClick))
    tags.add('o:tracking-opens', this.flagToYesNo(config.oTrackingOpens))
    return tags.toObject()
  }

  /**
   * Returns base url for sending emails
   */
  private getBaseUrl(): string {
    return this.config.domain
      ? `${this.config.baseUrl}/${this.config.domain}`
      : this.config.baseUrl
  }

  /**
   * Returns an object of custom headers
   */
  private getHeaders(config: MailgunConfig) {
    return config.headers || {}
  }

  /**
   * Formats an array of recipients to a string accepted by mailgun
   */
  private formatReceipents(
    recipients?: { address: string; name?: string }[]
  ): string | undefined {
    if (!recipients) {
      return
    }

    return recipients
      .map(recipient => {
        if (!recipient.name) {
          return recipient.address
        }
        return `${recipient.name} <${recipient.address}>`
      })
      .join(',')
  }

  /**
   * Returns an object of `to`, `cc` and `bcc`
   */
  private getRecipients(mail: any) {
    const recipients = new ObjectBuilder()
    recipients.add('to', this.formatReceipents(mail.data.to))
    recipients.add('cc', this.formatReceipents(mail.data.cc))
    recipients.add('bcc', this.formatReceipents(mail.data.bcc))
    return recipients.toObject()
  }

  /**
   * Send email
   */
  public async send(mail: any, callback: any) {
    const tags = this.getOTags(this.config)
    const headers = this.getHeaders(this.config)
    const recipients = this.getRecipients(mail)

    const envelope = mail.message.getEnvelope()

    const FormData = require('multi-part')

    const form = new FormData()
    const url = `${this.getBaseUrl()}/messages.mime`

    Object.keys(tags).forEach(key => form.append(key, tags[key]))
    Object.keys(headers).forEach(key => form.append(key, headers[key]))
    Object.keys(recipients).forEach(key => form.append(key, recipients[key]))
    form.append('message', mail.message.createReadStream(), {
      filename: 'message.mime'
    })

    this.logger.trace(
      {
        url,
        tags,
        headers
      },
      'mailgun email'
    )

    try {
      const response = await got.post<{ id: string }>(url, {
        body: form.stream(),
        username: 'api',
        password: this.config.key,
        responseType: 'json',
        headers: {
          ...form.getHeaders()
        }
      })
      const messageId = (response.body?.id || mail.message.messageId()).replace(
        /^<|>$/g,
        ''
      )
      callback(null, { messageId, envelope })
    } catch (error) {
      callback(EmailTransportException.apiFailure(error))
    }
  }
}
