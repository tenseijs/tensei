export interface Plan {
    description: string
    features: string[]
    monthlyID: string
    name: string
    slug: string
    yearlyID: string
    monthlyPrice: {
        price: {
            gross: number
        }
    }
    yearlyPrice: {
        price: {
            gross: number
        }
    }
    monthlyIncentive?: string
    yearlyIncentive?: string
}

export interface BillingConfig {
    portalPath: string
}
