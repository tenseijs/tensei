'use strict'

/*
 * adonis-mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import got from 'got'

class Request {
    private _auth: any = null
    private _headers: any = {}
    private _isJson: any = false
    private _basicAuth: any = null

    /**
     * Accept json
     *
     * @method isJson
     *
     * @chainable
     */
    acceptJson() {
        this._isJson = true
        return this
    }

    /**
     * Set auth header
     *
     * @method auth
     *
     * @param  {String} val
     *
     * @chainable
     */
    auth(val: any) {
        this._auth = val
        return this
    }

    /**
     * Set basic auth onrequest headers
     *
     * @method basicAuth
     *
     * @param  {String}  val
     *
     * @chainable
     */
    basicAuth(val: any) {
        this._basicAuth = val
        return this
    }

    /**
     * Set headers on request
     *
     * @method headers
     *
     * @param  {Object} headers
     *
     * @chainable
     */
    headers(headers: any) {
        this._headers = headers
        return this
    }

    /**
     * Make a post http request
     *
     * @method post
     *
     * @param  {String} url
     * @param  {Object} body
     *
     * @return {void}
     */
    async post(url: string, body: any) {
        const headers = this._auth
            ? Object.assign({ Authorization: this._auth }, this._headers)
            : this._headers
        try {
            const response = await got(url, {
                headers,
                body,
                json: this._isJson
                // auth: this._basicAuth
            })
            return response.body
        } catch ({ response, message }) {
            const error = new Error(message) as any
            error.errors = response.body
            throw error
        }
    }
}

export default Request
