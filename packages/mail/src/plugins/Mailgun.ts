import { plugin } from '@tensei/common'
import { MailgunDriver } from '../drivers/Mailgun'

import { MailgunConfig } from '@tensei/mail'

class MailgunPlugin {
    config: Omit<MailgunConfig, 'driver'> & {
        driver: string
    } = {
        driver: '',
        baseUrl: 'https://api.mailgun.net/v3',
        key: process.env.MAILGUN_API_KEY || '',
        domain: process.env.MAILGUN_DOMAIN || '',
        oDkim: false,
    }

    constructor(name: string) {
        this.config.driver = name
    }

    key(key: string) {
        this.config.key = key

        return this
    }

    domain(domain: string) {
        this.config.domain = domain

        return this
    }

    oDkim() {
        this.config.oDkim = true

        return this
    }

    plugin() {
        return plugin('Mailgun Mailer')
            .register(({ extendMailer, logger }) => {
                extendMailer(this.config.driver, (_, __, config) => new MailgunDriver(config as any, logger), this.config)
            })
    }
}

export const mailgun = (name: string) => new MailgunPlugin(name)
