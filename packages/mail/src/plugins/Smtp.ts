import { plugin } from '@tensei/common'
import { SmtpDriver } from '../drivers/Smtp'

import { SmtpConfig, SmtpOauth2, SmtpSimpleAuth } from '@tensei/mail'

class SmtpPlugin {
    config: Omit<SmtpConfig, 'driver'> & {
        driver: string
    } = {
        driver: '',
        host: process.env.SMTP_HOST || '',
        port: process.env.SMTP_PORT || '',
        auth: {
            type: 'login',
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || ''
        }
    }

    constructor(name: string) {
        this.config.driver = name
    }

    secure() {
        this.config.secure = true

        return this
    }

    host(host: string) {
        this.config.host = host

        return this
    }

    auth(auth: SmtpOauth2|SmtpSimpleAuth) {
        this.config.auth = auth

        return this
    }

    user(user: string) {
        this.config.auth = {
            ...(this.config.auth || {}),
            type: 'login',
            user
        } as any

        return this
    }

    pass(pass: string) {
        this.config.auth = {
            ...(this.config.auth || {}),
            pass
        } as any

        return this
    }

    port(port: string|number) {
        this.config.port = port

        return this
    }

    configure(config: Partial<SmtpConfig>) {
        this.config = {
            ...this.config,
            ...config
        }

        return this
    }

    plugin() {
        return plugin('Smtp Mailer')
            .register(({ extendMailer }) => {
                extendMailer(this.config.driver, (_, __, config) => new SmtpDriver(config as any), this.config)
            })
    }
}

export const smtp = (name: string) => new SmtpPlugin(name)
