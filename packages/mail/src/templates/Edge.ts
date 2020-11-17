/*
 * @fullstackjs/mail
 *
 * (c) Kati Frantz <frantz@fullstackjs.online>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Edge } from 'edge.js'
import BaseRenderEngine from './Base'

/**
 * This class defines a render method which will be used to
 * parse the view file in which the email was drafted.
 * This is specifically for edge view engine.
 *
 * @class EdgeRenderEngine
 * @constructor
 */
class EdgeRenderEngine extends BaseRenderEngine {
    private edge: any = new Edge({
        cache: false
    })

    /**
     * Initialize the base render engine.
     *
     * @return {Null}
     */
    constructor(config: any) {
        super(config)

        this.Config = config
    }

    /**
     * Render the content
     *
     * @param {String} path
     * @param {Object} data
     */
    render(view: string, data = {}) {
        const { html, text, watchHtml } = this._getContent(view)

        return {
            html: html ? this.edge.renderString(html, data) : null,
            text: text ? this.edge.renderString(text, data) : null,
            watchHtml: watchHtml
                ? this.edge.renderString(watchHtml, data)
                : null
        }
    }
}

export default EdgeRenderEngine
