export type SupportedPaymentGateways = 'paypal' | 'paystack'

export type SupportedCurrencies = 'us dollar' | 'canadian dollar' | 'naira'

interface StoreConfig {
    baseCountry: string
    baseState: string
    baseCurrency: SupportedCurrencies
    paymentGateways: SupportedPaymentGateways[]
    basePaymentGateway: SupportedPaymentGateways
}

export interface DigitalDownloadsPluginConfig {
    storeConfig: StoreConfig
    onSaleNotifications: boolean
    onSaleNotificationsConfig: onSaleNotificationsConfig
}

export interface onSaleNotificationsConfig {
    purchaseReceipts?: {
        from?: string
        name?: string
    }
    saleAlerts?: {
        emails?: String[]
    }
}
