import { plugin } from '@tensei/common'

import { SesConfig } from '@tensei/mail'

class SesPlugin {
    config: Omit<SesConfig, 'driver'> & {
        driver: string
    } = {
        driver: '',
        apiVersion: '2010-12-01',
        key: process.env.SES_ACCESS_KEY || '',
        secret: process.env.SES_ACCESS_SECRET || '',
        region: process.env.SES_REGION || 'us-east-1',
        sslEnabled: process.env.SSL_ENABLED === undefined ? true: !!process.env.SSL_ENABLED,
        sendingRate: 10,
        maxConnections: 5,
    }

    constructor(name: string) {
        this.config.driver = name
    }

    key(key: string) {
        this.config.key = key

        return this
    }

    secret(secret: string) {
        this.config.secret = secret

        return this
    }

    region(region: string) {
        this.config.region = region

        return this
    }

    noSsl() {
        this.config.sslEnabled = false

        return this
    }
    
    apiVersion(version: string) {
        this.config.apiVersion = version

        return this
    }

    configure(config: Partial<SesConfig>) {
        this.config = {
            ...this.config,
            ...config
        }

        return this
    }

    plugin() {
        return plugin('Ses Mailer')
            .register(({ extendMailer }) => {
                const { SesDriver } = require('../drivers/Ses')
                extendMailer(this.config.driver, (_, __, config) => new SesDriver(config), this.config)
            })
    }
}

export const ses = (name: string) => new SesPlugin(name)
