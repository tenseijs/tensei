export type SupportedDrivers = 'ethereal' | 'ses' | 'mailgun' | 'smtp'

export interface SmtpConfig {
    host: string
    driver: 'smtp'
    port?: number | string
    secure?: boolean

    /**
     * Authentication
     */
    auth?: any

    /**
     * TLS options
     */
    tls?: any
    ignoreTLS?: boolean
    requireTLS?: boolean

    /**
     * Pool options
     */
    pool?: boolean
    maxConnections?: number
    maxMessages?: number
    rateDelta?: number
    rateLimit?: number

    /**
     * Proxy
     */
    proxy?: string
}

export interface MailConfig {
    smtp: SmtpConfig
}

export type Address =
    | string
    | {
          address: string
          name: string
      }
    | Array<{
          address: string
          name: string
      }>

export interface DriverInterface {}
