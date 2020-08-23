/*
 * @fullstackjs/mail
 *
 * (c) Kati Frantz <frantz@fullstackjs.online>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Fs from 'fs'
import Path from 'path'
import Helpers from '../helpers'

/**
 * This class is the base for all render engines. Contains
 * helpful methods used in all the render engines.
 *
 * @class BaseRenderEngine
 * @constructor
 */
class BaseRenderEngine {
    protected Config: any = {}

    private enginesExtensionsMap: any = {}

    /**
     * Initialize the base render engine.
     *
     * @return {Null}
     */
    constructor(config: any) {
        this.Config = config

        const supportedViewEngines = Helpers.getSupportedEngines()

        if (!supportedViewEngines.includes(this.Config.viewEngine)) {
            throw new Error(`The View engine you configured is not defined.`)
        }

        this.enginesExtensionsMap = Helpers.getEnginesExtensionsMap()
    }

    /**
     * This method gets the content of the view we want to render
     *
     * @param {String} path the name of the view
     * @return {any} content
     */
    _getContent(view: string) {
        return {
            html: this._getFileContent(view, 'html'),
            text: this._getFileContent(view, 'text'),
            watchHtml: this._getFileContent(view, 'watch-html')
        }
    }

    /**
     * This method gracefully tries to get the content of the template file.
     * It returns null if file is not found.
     *
     * @param {String} view
     * @param {String} type
     *
     * @private
     *
     * @return {String|Null}
     *
     */
    _getFileContent(view: string, type: string) {
        const engine = this.Config.viewEngine

        try {
            return Fs.readFileSync(
                this._getViewsPath(
                    `${view}/${view}.${type}.${this.enginesExtensionsMap[engine]}`
                ),
                'utf8'
            )
        } catch (e) {
            return null
        }
    }

    /**
     * This method resolves the path to the where all mails are stored.
     * It uses the default which is a folder called mails.
     *
     * @param {String} view
     *
     * @private
     *
     * @return {String}
     *
     */
    _getViewsPath(view: string) {
        if (this.Config.useCustomMailPaths)
            return `${this.Config.views}/${view}`

        const currentWorkingDirectory = process.cwd()

        return Path.resolve(
            currentWorkingDirectory,
            this.Config.views || 'mails',
            view
        )
    }
}

export default BaseRenderEngine
