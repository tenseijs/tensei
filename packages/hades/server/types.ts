import Plan from './Plan'

export interface HadesConfig {
    customerResourceName: string
    plans: Plan[]
    stripeKey: string
    cardUpfront: boolean
    logo: string
    trialDays?: number
    portalPath: string
    prorates: boolean
    monthlyIncentive?: string
    yearlyIncentive?: string
}

export enum BILLING_EVENTS {
    SUBSCRIPTION_CREATED = 'subscription::created',
    SUBSCRIPTION_UPDATED = 'subscription::updated',
    SUBSCRIPTION_CANCELLED = 'subscription::cancelled'
}
