/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import got from 'got'
import getStream from 'get-stream'

import { Config } from '@tensei/common'
import { SparkPostConfig } from '@tensei/mail'

import { ObjectBuilder } from '../utils'
import { EmailTransportException } from '../exceptions/EmailTransportException'

/**
 * Sparkpost transport for node mailer. Uses the `/message.mime` to send MIME
 * representation of the email
 */
export class SparkPostTransport {
  public name = 'sparkpost'
  public version = '1.0.0'

  constructor(
    private config: SparkPostConfig,
    private logger: Config['logger']
  ) {}

  /**
   * Returns base url for sending emails
   */
  private getBaseUrl(): string {
    return this.config.baseUrl
  }

  /**
   * Returns an array of recipients accepted by the SparkPost API
   */
  private getRecipients(
    recipients: { address: string; name?: string }[]
  ): { address: { name?: string; email: string } }[] {
    return recipients.map(recipient => {
      return {
        address: {
          email: recipient.address,
          ...(recipient.name ? { name: recipient.name } : {})
        }
      }
    })
  }

  /**
   * Returns an object of options accepted by the sparkpost mail API
   */
  private getOptions(config: SparkPostConfig) {
    const options = new ObjectBuilder()
    options.add('start_time', config.startTime)
    options.add('open_tracking', config.openTracking)
    options.add('click_tracking', config.clickTracking)
    options.add('transactional', config.transactional)
    options.add('sandbox', config.sandbox)
    options.add('skip_suppression', config.skipSuppression)
    options.add('ip_pool', config.ipPool)
  }

  /**
   * Send email
   */
  public async send(mail: any, callback: any) {
    const url = `${this.getBaseUrl()}/transmissions`
    const options = this.getOptions(this.config)
    const envelope = mail.message.getEnvelope()
    const addresses = (mail.data.to || [])
      .concat(mail.data.cc || [])
      .concat(mail.data.bcc || [])

    try {
      this.logger.trace(
        {
          url,
          options
        },
        'sparkpost email'
      )

      /**
       * The sparkpost API doesn't accept the multipart stream and hence we
       * need to convert the stream to a buffer
       */
      const emailBody = await getStream(mail.message.createReadStream())
      const response = await got.post<{ results?: { id: string } }>(url, {
        json: {
          recipients: this.getRecipients(addresses),
          options: options,
          content: {
            email_rfc822: emailBody
          }
        },
        responseType: 'json',
        headers: {
          Authorization: this.config.key
        }
      })

      const messageId = (
        response.body.results?.id || mail.message.messageId()
      ).replace(/^<|>$/g, '')
      callback(null, { messageId, envelope })
    } catch (error) {
      callback(EmailTransportException.apiFailure(error))
    }
  }
}
