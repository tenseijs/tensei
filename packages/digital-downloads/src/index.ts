import {
    DigitalDownloadsPluginConfig,
    onSaleNotificationsConfig
} from './config'

class DigitalDownloads {
    private config: DigitalDownloadsPluginConfig = {
        storeConfig: {
            baseCountry: 'default',
            baseState: 'default',
            baseCurrency: 'us dollar',
            paymentGateways: ['paypal'],
            basePaymentGateway: 'paypal'
        },
        onSaleNotifications: false,
        onSaleNotificationsConfig: {
            purchaseReceipts: { from: '', name: '' },
            saleAlerts: { emails: [] }
        }
    }

    public storeConfig(...allArguments: any) {
        this.config.storeConfig = allArguments

        return this
    }

    public onSaleNotifications() {
        this.config.onSaleNotifications = true

        return this
    }

    public onSaleNotificationsConfig(config: onSaleNotificationsConfig) {
        this.config.onSaleNotificationsConfig = config

        return this
    }
}

export const digitalDownloads = () => new DigitalDownloads()
