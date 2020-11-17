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
import { DriverInterface } from '../config'

/**
 * Ethereal driver is used to run test emails
 *
 * @class EtherealDriver
 * @constructor
 */
class EtherealDriver implements DriverInterface {
    private transporter: any = null
    private log: any = null
    /**
     * This method is called by mail manager automatically
     * and passes the config object
     *
     * @method setConfig
     *
     * @param  {Object}  config
     */
    setConfig(config: any) {
        if (config.user && config.pass) {
            this.setTransporter(config.user, config.pass)
        } else {
            this.transporter = null
        }

        this.log =
            typeof config.log === 'function'
                ? config.log
                : function(messageUrl: string) {
                      console.log(messageUrl)
                  }
    }

    /**
     * Initiate transporter
     *
     * @method setTransporter
     *
     * @param  {String}       user
     * @param  {String}       pass
     */
    setTransporter(user: string, pass: string) {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user, pass }
        })
    }

    /**
     * Creates a new transporter on fly
     *
     * @method createTransporter
     *
     * @return {String}
     */
    createTransporter() {
        return new Promise((resolve, reject) => {
            nodemailer.createTestAccount((error, account) => {
                if (error) {
                    reject(error)
                    return
                }
                this.setTransporter(account.user, account.pass)
                resolve()
            })
        })
    }

    /**
     * Sends email
     *
     * @method sendEmail
     *
     * @param  {Object}  message
     *
     * @return {Object}
     */
    sendEmail(message: any) {
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
    async send(message: any) {
        if (!this.transporter) {
            await this.createTransporter()
        }

        const mail = await this.sendEmail(message)
        this.log(nodemailer.getTestMessageUrl(mail as any))

        return mail
    }
}

export default EtherealDriver
