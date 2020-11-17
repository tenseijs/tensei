'use strict'

/*
 * adonis-mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import nodemailer from 'nodemailer'
import getStream from 'get-stream'
import Request from '../Request'

/**
 * The core transportor node-mailer
 *
 * @class SparkPostTransporter
 * @constructor
 */
class SparkPostTransporter {
    private config: any = null

    constructor(config: any) {
        this.config = config
    }

    /**
     * The api endpoint for sparkpost
     *
     * @attribute endpoint
     *
     * @return {String}
     */
    get endpoint() {
        return `${this.config.endpoint ||
            'https://api.sparkpost.com/api/v1'}/transmissions`
    }

    /**
     * Transport name
     *
     * @attribute name
     *
     * @return {String}
     */
    get name() {
        return 'sparkpost'
    }

    /**
     * Transport version
     *
     * @attribute version
     *
     * @return {String}
     */
    get version() {
        return '1.0.0'
    }

    /**
     * Validations to make sure to config is complete
     *
     * @method _runValidations
     *
     * @return {String}
     *
     * @private
     */
    _runValidations() {
        if (!this.config.apiKey) {
            throw new Error(
                'Please define the sparkpost API key to send emails'
            )
        }
    }

    /**
     * Returns the name and email formatted as spark
     * recipient
     *
     * @method _getReceipent
     *
     * @param  {String|Object}      item
     *
     * @return {Object}
     *
     * @private
     */
    _getRecipient(item: any) {
        return typeof item === 'string'
            ? { email: item }
            : { email: item.address, name: item.name }
    }

    /**
     * Returns an array of recipients formatted
     * as per spark post standard.
     *
     * @method _getRecipients
     *
     * @param  {Object}       mail
     *
     * @return {Array}
     *
     * @private
     */
    _getRecipients(mail: any) {
        let recipients: any = []

        /**
         * To addresses
         */
        recipients = recipients.concat(
            mail.data.to.map((address: any) => {
                return { address: this._getRecipient(address) }
            })
        )

        /**
         * Cc addresses
         */
        recipients = recipients.concat(
            (mail.data.cc || []).map((address: any) => {
                return { address: this._getRecipient(address) }
            })
        )

        /**
         * Bcc addresses
         */
        recipients = recipients.concat(
            (mail.data.bcc || []).map((address: any) => {
                return { address: this._getRecipient(address) }
            })
        )

        return recipients
    }

    /**
     * Format success message
     *
     * @method _formatSuccess
     *
     * @param  {Object}       response
     *
     * @return {String}
     *
     * @private
     */
    _formatSuccess(response: any) {
        if (!response.results) {
            return response
        }

        return {
            messageId: response.results.id,
            acceptedCount: response.results.total_accepted_recipients,
            rejectedCount: response.results.total_rejected_recipients
        }
    }

    /**
     * Returns options to be sent with email
     *
     * @method _getOptions
     *
     * @param  {Object}    extras
     *
     * @return {Object|Null}
     *
     * @private
     */
    _getOptions(extras: any) {
        extras = extras || this.config.extras
        return extras && extras.options ? extras.options : null
    }

    /**
     * Returns the campaign id for the email
     *
     * @method _getCampaignId
     *
     * @param  {Object}       extras
     *
     * @return {String|null}
     *
     * @private
     */
    _getCampaignId(extras: any) {
        extras = extras || this.config.extras
        return extras && extras.campaign_id ? extras.campaign_id : null
    }

    /**
     * Sending email from transport
     *
     * @method send
     *
     * @param  {Object}   mail
     * @param  {Function} callback
     *
     * @return {void}
     */
    send(mail: any, callback: any) {
        this._runValidations()
        const recipients = this._getRecipients(mail)
        const options = this._getOptions(mail.data.extras)
        const campaignId = this._getCampaignId(mail.data.extras)

        /**
         * Post body
         *
         * @type {Object}
         */
        const body: any = { recipients }

        /**
         * If email has options sent them along
         */
        if (options) {
            body.options = options
        }

        /**
         * If email has campaign id sent it along
         */
        if (campaignId) {
            body.campaign_id = campaignId
        }

        getStream(mail.message.createReadStream())
            .then(content => {
                body.content = { email_rfc822: content }
                return new Request()
                    .auth(this.config.apiKey)
                    .acceptJson()
                    .post(this.endpoint, body)
            })
            .then(response => {
                callback(null, this._formatSuccess(response))
            })
            .catch(callback)
    }
}

/**
 * Spark post driver for adonis mail
 *
 * @class SparkPost
 * @constructor
 */
class SparkPost {
    private transporter: any = null
    /**
     * This method is called by mail manager automatically
     * and passes the config object
     *
     * @method setConfig
     *
     * @param  {Object}  config
     */
    setConfig(config: any) {
        this.transporter = nodemailer.createTransport(
            new SparkPostTransporter(config)
        )
    }

    /**
     * Send a message via message object
     *
     * @method send
     * @async
     *
     * @param  {Object} message
     *
     * @return {Object}
     *
     * @throws {Error} If promise rejects
     */
    send(message: any) {
        return new Promise((resolve, reject) => {
            this.transporter.sendMail(message, (error: any, result: any) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
            })
        })
    }
}

export default SparkPost
export const Transport = SparkPostTransporter
