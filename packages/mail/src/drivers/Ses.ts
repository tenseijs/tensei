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

class SesDriver {
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
        this.transporter = nodemailer.createTransport({
            SES: new (require('aws-sdk').SES)(config)
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
                    resolve(result)
                }
            })
        })
    }
}

export default SesDriver
