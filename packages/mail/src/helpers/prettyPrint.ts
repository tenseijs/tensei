/*
 * @adonisjs/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import nodemailer from 'nodemailer'
import { MailEventData } from '@tensei/mail'

/**
 * Formats recipients for display
 */
function formatRecipients(recipients: string[]) {
  return recipients.length <= 3
    ? recipients.join(',')
    : `${recipients.length} recipients`
}

/**
 * Returns display message for the accepted recipients (if any)
 */
function getAcceptedRecipients(
  response: MailEventData['response']
): string | undefined {
  if ('accepted' in response) {
    return formatRecipients(response.accepted)
  }
}

/**
 * Returns display message for the accepted recipients (if any)
 */
function getRejectedRecipients(
  response: MailEventData['response']
): string | undefined {
  if ('rejected' in response) {
    return formatRecipients(response.rejected)
  }
}

/**
 * Returns display message for the accepted recipients (if any)
 */
function getMessageRecipients(message: MailEventData['message']): string {
  return formatRecipients((message.to || []).map(({ address }) => address))
}

/**
 * Pretty prints the email event
 */
export function prettyPrint(mail: MailEventData) {
  /**
   * Lazy loading pretty printed dependencies
   */
  const { Colors } = require('@poppinss/colors')
  const colors = new Colors()

  /**
   * Begin
   */
  let output: string = colors.dim(`┌ "${mail.mailer}" `)

  /**
   * Concatenate the mail subject
   */
  output += colors.underline(
    `Subject: ${mail.message.subject || 'No Subject'} `
  )

  /**
   * Show views (if used)
   */
  if (mail.views.length) {
    output += colors.dim(` (${mail.views.join(',')})`)
  }

  /**
   * Show from address
   */
  output += `\n${colors.dim('│')}  ${colors.dim('from:')} ${
    mail.message.from?.address
  }`

  /**
   * Show accepted or to recipients
   */
  const acceptedRecipients = getAcceptedRecipients(mail.response)
  if (acceptedRecipients) {
    output += `\n${colors.dim('│')}  ${colors.dim(
      'accepted:'
    )} ${acceptedRecipients}`
  } else {
    output += `\n${colors.dim('│')}  ${colors.dim(
      'to:'
    )} ${getMessageRecipients(mail.message)}`
  }

  /**
   * Show rejected recipients
   */
  const rejectedRecipients = getRejectedRecipients(mail.response)
  if (rejectedRecipients) {
    output += `\n${colors.dim('│')}  ${colors
      .red()
      .dim('rejected:')} ${rejectedRecipients}`
  }

  /**
   * Show total attachments
   */
  const attachments = (mail.message.attachments || []).length
  output += `\n${colors.dim('│')}  ${colors.dim(
    'attachments:'
  )} ${attachments} attachment(s)`

  /**
   * Preview url (if any)
   */
  const previewUrl = nodemailer.getTestMessageUrl(mail.response)
  if (previewUrl) {
    output += `\n${colors.dim('│')}  ${colors.dim('url:')} ${previewUrl}`
  }

  /**
   * End
   */
  output += `\n${colors.dim('└')}  sent`

  /**
   * Print it to the console
   */
  console.log(output)
}
