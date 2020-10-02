/*
 * @fullstackjs/mail
 *
 * (c) Kati Frantz <frantz@fullstackjs.online>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import MailManager from './Manager'
import { Stream } from 'nodemailer/lib/xoauth2'
import { SupportedDrivers, Address } from './config'

/**
 * This class is used to compose and send aa mail
 *
 * @class Mail
 * @constructor
 */
export class Mail {
    public Config: any = {}

    private _driverInstance: any = {}

    /**
     * The mail message details such as to,
     * from, address, subject, etc
     *
     * @type {Object}
     */
    public mailerMessage: any = {}

    /**
     * Parse and set address object/array on
     * the address key
     *
     * @method _setAddress
     *
     * @param  {String}    key
     * @param  {String|Array}    address
     * @param  {String}    [name]
     *
     * @private
     */
    private _setAddress(key: string, address: Address, name?: string) {
        this.mailerMessage[key] = this.mailerMessage[key] || []

        /**
         * If address is an array of address object, then concat
         * it directly
         */
        if (address instanceof Array === true) {
            this.mailerMessage[key] = this.mailerMessage[key].concat(address)

            return
        }

        const addressObj = name ? { name, address } : address
        this.mailerMessage[key].push(addressObj)
    }

    public config(config: any) {
        this.Config = config

        return this
    }

    /**
     * Change the email connection at runtime
     *
     * @method connection
     *
     * @param {String} connection
     *
     * @chainable
     *
     */
    connection(connection: SupportedDrivers) {
        /**
         * Cannot get config for the defined connection
         */
        if (!this.Config) {
            throw new Error(`Missing configuration for ${connection}.`)
        }

        this._driverInstance = MailManager.driver(connection, this.Config)

        return this
    }

    /**
     * Set `from` on the email.
     *
     * @method from
     *
     * @param  {String|Array} address
     * @param  {String} [name]
     *
     * @chainable
     *
     * @example
     * ```
     *  // just email
     * message.from('foo@bar.com')
     *
     *  // name + email
     * message.from('foo@bar.com', 'Foo')
     *
     * // Address object
     * message.from([{ address: 'foo@bar.com', name: 'Foo' }])
     * ```
     */
    from(address: Address, name?: string) {
        this._setAddress('from', address, name)
        return this
    }

    /**
     * Set `to` on the email.
     *
     * @method to
     *
     * @param  {String|Array} address
     * @param  {String} [name]
     *
     * @chainable
     *
     * @example
     * ```
     *  // just email
     * message.to('foo@bar.com')
     *
     *  // name + email
     * message.to('foo@bar.com', 'Foo')
     *
     * // Address object
     * message.to([{ address: 'foo@bar.com', name: 'Foo' }])
     * ```
     */
    to(address: Address, name?: string) {
        this._setAddress('to', address, name)
        return this
    }

    /**
     * Set `cc` on the email.
     *
     * @method cc
     *
     * @param  {String|Array} address
     * @param  {String} [name]
     *
     * @chainable
     *
     * @example
     * ```
     *  // just email
     * message.cc('foo@bar.com')
     *
     *  // name + email
     * message.cc('foo@bar.com', 'Foo')
     *
     * // Address object
     * message.cc([{ address: 'foo@bar.com', name: 'Foo' }])
     * ```
     */
    cc(address: Address, name?: string) {
        this._setAddress('cc', address, name)
        return this
    }

    /**
     * Set `bcc` on the email.
     *
     * @method bcc
     *
     * @param  {String|Array} address
     * @param  {String} [name]
     *
     * @chainable
     *
     * @example
     * ```
     *  // just email
     * message.bcc('foo@bar.com')
     *
     *  // name + email
     * message.bcc('foo@bar.com', 'Foo')
     *
     * // Address object
     * message.bcc([{ address: 'foo@bar.com', name: 'Foo' }])
     * ```
     */
    bcc(address: Address, name?: string) {
        this._setAddress('bcc', address, name)
        return this
    }

    /**
     * Set `sender` on the email.
     *
     * @method sender
     *
     * @param  {String|Array} address
     * @param  {String} [name]
     *
     * @chainable
     *
     * @example
     * ```
     *  // just email
     * message.sender('foo@bar.com')
     *
     *  // name + email
     * message.sender('foo@bar.com', 'Foo')
     *
     * // Address object
     * message.sender([{ address: 'foo@bar.com', name: 'Foo' }])
     * ```
     */
    sender(address: Address, name?: string) {
        this._setAddress('sender', address, name)
        return this
    }

    /**
     * Set `replyTo` on the email.
     *
     * @method replyTo
     *
     * @param  {String|Array} address
     * @param  {String} [name]
     *
     * @chainable
     *
     * @example
     * ```
     *  // just email
     * message.replyTo('foo@bar.com')
     *
     *  // name + email
     * message.replyTo('foo@bar.com', 'Foo')
     *
     * // Address object
     * message.replyTo([{ address: 'foo@bar.com', name: 'Foo' }])
     * ```
     */
    replyTo(address: Address, name?: string) {
        this._setAddress('replyTo', address, name)
        return this
    }

    /**
     * Set in reply to message id
     *
     * @method inReplyTo
     *
     * @param  {String}  messageId
     *
     * @chainable
     *
     * ```js
     * message.inReplyTo('101002001')
     * ```
     */
    inReplyTo(messageId: string) {
        this.mailerMessage.inReplyTo = messageId
        return this
    }

    /**
     * Set subject for the emaul
     *
     * @method subject
     *
     * @param  {String} subject
     *
     * @chainable
     */
    subject(subject: string) {
        this.mailerMessage.subject = subject
        return this
    }

    /**
     * Set the data to be use to compile templates
     *
     * @method data
     *
     * @param  {Object} data
     *
     * @chainable
     *
     */
    datax(data = {}) {
        // this.data = data

        return this
    }

    /**
     * Set email text body
     *
     * @method text
     *
     * @param  {String} text
     *
     * @chainable
     */
    setText(text: string) {
        this.mailerMessage.text = text

        return this
    }

    /**
     * Set email html body
     *
     * @method html
     *
     * @param  {String} html
     *
     * @chainable
     */
    setHtml(html: string) {
        this.mailerMessage.html = html

        return this
    }

    /**
     * Set html for apple watch
     *
     * @method watchHtml
     *
     * @param  {String}  html
     *
     * @chainable
     */
    setWatchHtml(html: string) {
        this.mailerMessage.watchHtml = html

        return this
    }

    /**
     * Add a new attachment to the mail
     *
     * @method attach
     *
     * @param  {String} content
     * @param  {Object} [options]
     *
     * @chainable
     *
     * @example
     * ```js
     * message.attach('absolute/path/to/file')
     * message.attach('absolute/path/to/file', { contentTpe: 'plain/text' })
     * ```
     */
    attach(
        filePath: string,
        options: {
            [key: string]: string
        }
    ) {
        this.mailerMessage.attachments = this.mailerMessage.attachments || []

        const attachment = Object.assign({ path: filePath }, options || {})

        this.mailerMessage.attachments.push(attachment)

        return this
    }

    /**
     * Attach raw data as attachment with a custom file name
     *
     * @method attachData
     *
     * @param  {String|Buffer|Stream}   content
     * @param  {String}                 filename
     * @param  {Object}                 [options]
     *
     * @chainable
     *
     * @example
     * ```js
     * message.attachData('hello', 'hello.txt')
     * message.attachData(new Buffer('hello'), 'hello.txt')
     * message.attachData(fs.createReadStream('hello.txt'), 'hello.txt')
     * ```
     */
    attachData(
        content: string | Buffer | Stream,
        filename: string,
        options: any
    ) {
        if (!filename) {
            throw new Error(
                'Define filename as 2nd argument when calling mail.attachData'
            )
        }

        this.mailerMessage.attachments = this.mailerMessage.attachments || []

        const attachment = Object.assign({ content, filename }, options || {})

        this.mailerMessage.attachments.push(attachment)

        return this
    }

    /**
     * Set alternative content for the email.
     *
     * @method alternative
     *
     * @param  {String} content
     * @param  {Object} [options]
     *
     * @chainable
     *
     * @example
     * ```js
     * message.alternative('**Hello**', { contentType: 'text/x-web-markdown' })
     * ```
     */
    alternative(content: string, options: any) {
        this.mailerMessage.alternatives = this.mailerMessage.alternatives || []
        const alternative = Object.assign({ content }, options)
        this.mailerMessage.alternatives.push(alternative)
        return this
    }

    /**
     * Embed image to the content. This is done
     * via cid.
     *
     * @method embed
     *
     * @param  {String} filePath
     * @param  {String} cid   - Must be unique to single email
     * @param  {Object} [options]
     *
     * @chainable
     *
     * @example
     * ```
     * message.embed('logo.png', 'logo')
     * // inside html
     * <img src="cid:logo" />
     * ```
     */
    embed(filePath: string, cid: any, options: any) {
        return this.attach(filePath, Object.assign({ cid }, options))
    }

    /**
     * Set extras to be sent to the current driver in
     * use. It is the responsibility of the driver
     * to parse and use the extras
     *
     * @method driverExtras
     *
     * @param  {Object}     extras
     *
     * @chainable
     */
    driverExtras(extras: any) {
        this.mailerMessage.extras = extras

        return this
    }

    /**
     * Send the message using the defined driver. The
     * callback will receive the message builder
     * instance
     *
     * @method send
     * @async
     *
     * @param  {String|Array}  views
     * @param  {Object}        [data]
     * @param  {Function}      callback
     *
     * @return {Object}
     *
     * @example
     * ```js
     * await sender.send('welcome', {}, (message) => {
     *   message.from('foo@bar.com')
     * })
     *
     * await sender.send(['welcome', 'welcome.text', 'welcome.watch'], {}, (message) => {
     *   message.from('foo@bar.com')
     * })
     * ```
     *
     * @throws {Error} If promise fails
     */
    async send() {
        // const { html, text, watchHtml } = this.View.render(this.template, this.data)

        // if (html) {
        //   this._setHtml(html)
        // }

        // if (text) {
        //   this._setText(text)
        // }

        // if (watchHtml) {
        //   this._setWatchHtml(watchHtml)
        // }

        return this._driverInstance.send(this.mailerMessage)
    }

    /**
     * Send email via raw text
     *
     * @method raw
     * @async
     *
     * @param  {String}   body
     * @param  {Function} callback
     *
     * @return {Object}
     *
     * @example
     * ```js
     * await sender.raw('Your security code is 301030', (message) => {
     *   message.from('foo@bar.com')
     * })
     * ```
     */
    async sendRaw(body: string) {
        if (/^\s*</.test(body)) {
            this.setHtml(body)
        } else {
            this.setText(body)
        }

        return this._driverInstance.send(this.mailerMessage)
    }
}

export const mail = () => new Mail()
