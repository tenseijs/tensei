/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../types/mail.ts" />

import {
  MailManagerContract,
  MessageContract,
  MailerContract,
  BaseMailerContract,
  MailersList
} from '@tensei/mail'

export abstract class BaseMailer
  implements BaseMailerContract<keyof MailersList> {
  /**
   * Reference to the mailer. Assigned inside the service provider
   */
  public static mail: MailManagerContract
  public mail = (this.constructor as typeof BaseMailer).mail

  /**
   * An optional method to use a custom mailer and its options
   */
  public mailer?: MailerContract<any>

  /**
   * Prepare mail message
   */
  public abstract prepare(message: MessageContract): Promise<any> | any

  /**
   * Preview email
   */
  public async preview() {
    return this.mail.preview(async message => {
      await this.prepare(message)
    })
  }

  /**
   * Send email
   */
  public async send() {
    return (this.mailer || this.mail.use()).send(async message => {
      await this.prepare(message)
    })
  }

  /**
   * Send email by pushing it to the in-memory queue
   */
  public async sendLater() {
    return (this.mailer || this.mail.use()).sendLater(async message => {
      await this.prepare(message)
    })
  }
}
