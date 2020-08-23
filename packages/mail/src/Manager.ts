'use strict'

/*
 * adonis-mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Drivers from './drivers'

/**
 * Mail manager manages the drivers and also
 * exposes the api to add new drivers.
 *
 * @class MailManager
 * @constructor
 */
class MailManager {
    private _drivers: any = {}

    constructor() {
        this._drivers = {}
    }

    /**
     * Exposing api to be extend, IoC container will
     * use this method when someone tries to
     * extend mail provider
     *
     * @method extend
     *
     * @param  {String} name
     * @param  {Object} implementation
     *
     * @return {void}
     */
    extend(name: string, implementation: any) {
        this._drivers[name] = implementation
    }

    /**
     * Returns an instance of sender with the defined
     * driver.
     *
     * @method driver
     *
     * @param  {String} name
     * @param  {Object} config
     * @param  {Object} viewInstance
     *
     * @return {Object}
     */
    driver(name: string, config: any) {
        if (!name) {
            throw new Error('Cannot get driver instance without a name')
        }

        name = name.toLowerCase()
        const Driver = Drivers[name] || this._drivers[name]

        if (!Driver) {
            throw new Error(`${name} is not a valid mail driver`)
        }

        const driverInstance = new Driver()

        driverInstance.setConfig(config)

        return driverInstance
    }
}

export default new MailManager()
