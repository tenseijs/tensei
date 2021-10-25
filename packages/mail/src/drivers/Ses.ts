/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../types/mail.ts" />

import * as aws from 'aws-sdk'
import nodemailer from 'nodemailer'

import {
  MessageNode,
  SesMailResponse,
  SesConfig,
  SesDriverContract
} from '@tensei/mail'

/**
 * Ses driver to send email using ses
 */
export class SesDriver implements SesDriverContract {
  private transporter: any

  constructor(config: SesConfig) {
    this.transporter = nodemailer.createTransport({
      SES: new aws.SES({
        apiVersion: config.apiVersion,
        accessKeyId: config.key,
        secretAccessKey: config.secret,
        region: config.region,
        sslEnabled: config.sslEnabled
      }),
      sendingRate: config.sendingRate,
      maxConnections: config.maxConnections
    })
  }

  /**
   * Send message
   */
  public async send(
    message: MessageNode,
    options?: Omit<
      aws.SES.Types.SendRawEmailRequest,
      'RawMessage' | 'Source' | 'Destinations'
    >
  ): Promise<SesMailResponse> {
    if (!this.transporter) {
      throw new Error(
        'Driver transport has been closed and cannot be used for sending emails'
      )
    }

    return this.transporter.sendMail(
      Object.assign({}, message, { ses: options })
    )
  }

  /**
   * Close transporter connection, helpful when using connections pool
   */
  public async close() {
    this.transporter.close()
    this.transporter = null
  }
}
