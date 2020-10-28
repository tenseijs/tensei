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

/**
 * Memory driver is used to get the message back as
 * an object over sending it to a real user.
 *
 * @class MemoryDriver
 * @constructor
 */
export default class MemoryDriver {
    private transporter: any = null
    /**
     * This method is called by mail manager automatically
     * and passes the config object
     *
     * @method setConfig
     */
    setConfig() {
        this.transporter = nodemailer.createTransport({
            jsonTransport: true
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
    send(message: any) {
        return new Promise((resolve, reject) => {
            this.transporter.sendMail(message, (error: any, result: any) => {
                if (error) {
                    reject(error)
                } else {
                    /**
                     * Parsing and mutating the message to a JSON object
                     */
                    result.message = JSON.parse(result.message)
                    resolve(result)
                }
            })
        })
    }
}
