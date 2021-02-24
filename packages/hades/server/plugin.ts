import Fs from 'fs'
import Path from 'path'
import Dayjs from 'dayjs'
import Mustache from 'mustache'

import Plan from './Plan'
import {
    plugin,
    resource,
    text,
    integer,
    timestamp,
    belongsTo,
    boolean,
    hasMany,
} from '@tensei/common'

const indexFileContent = Fs.readFileSync(
    Path.resolve(__dirname, '..', 'index.mustache')
).toString()

import { HadesConfig } from './types'

import { frontendState } from './FrontendState'

class Hades {
    private config: HadesConfig = {
        plans: [],
        logo: '',
        trialDays: 14,
        portalPath: 'billing',
        cardUpfront: false,
        prorates: true,
        customerResourceName: 'User',
        stripeKey: process.env.STRIPE_KEY || ''
    }

    public customerResourceName(name: string) {
        this.config.customerResourceName = name

        return this
    }

    public doNotProrate() {
        this.config.prorates = false

        return this
    }

    public prorate() {
        this.config.prorates = true

        return this
    }

    public trialDays(trialDays: number) {
        this.config.trialDays = trialDays

        return this
    }

    public noTrial() {
        this.config.trialDays = undefined

        return this
    }

    public monthlyIncentive(incentive: string) {
        this.config.monthlyIncentive = incentive

        return this
    }

    public yearlyIncentive(incentive: string) {
        this.config.yearlyIncentive = incentive

        return this
    }

    private customerFields() {
        return [
            boolean('Has High Risk Payment').nullable().hideOnApi(),
            timestamp('Trial Ends At').nullable(),
            text('Pending Checkout ID').nullable().hideOnApi(),
            hasMany('Subscription'),
            hasMany('Receipt'),
        ]
    }

    private receiptsResource() {
        return resource('Receipt').fields([
            text('Paddle Subscription ID').searchable().nullable(),
            text('Checkout ID'),
            text('Order ID').unique(),
            text('Amount'),
            text('Tax'),
            text('Currency'),
            integer('Quantity'),
            text('Receipt URL').unique(),
            timestamp('Paid At'),
            belongsTo(this.config.customerResourceName)
        ])
    }

    public portalPath(path: string) {
        this.config.portalPath = path

        return this
    }

    public logo(logo: string) {
        this.config.logo = logo

        return this
    }

    private subscriptionsResource() {
        return resource('Subscription')
            .hideFromNavigation()
            .hideOnApi()
            .fields([
                text('Name').rules('required'),
                text('Paddle Id').unique().rules('required'),
                text('Paddle Plan').rules('required'),
                text('Paddle Status').rules('required'),
                integer('Quantity'),
                timestamp('Trial Ends At').nullable(),
                timestamp('Paused From').nullable(),
                timestamp('Ends At').nullable(),
                belongsTo(this.config.customerResourceName)
            ])
    }

    public plans(plans: Plan[]) {
        this.config.plans = plans

        return this
    }

    public stripeKey(key: string) {
        this.config.stripeKey = key

        return this
    }

    public cardUpfront() {
        this.config.cardUpfront = true

        return this
    }

    public plugin() {
        return plugin('Hades')
            .register(({ extendResources, resources, logger }) => {
                extendResources([this.subscriptionsResource(), this.receiptsResource()])

                const billable = resources.find(resource => resource.data.name === this.config.customerResourceName)

                if (! billable) {
                    logger.error(`Billable resource ${this.config.customerResourceName} was not found.`)
                } else {
                    billable.fields(this.customerFields())

                    const trialDays = this.config.trialDays

                    billable.beforeCreate(({ em, entity }) => {
                        em.assign(entity, {
                            trial_ends_at: trialDays ? Dayjs().add(trialDays, 'd').toISOString() : null
                        })
                    })
                }
            })
            .boot(({ resources, app, name }) => {
                const customerResource = resources.find(
                    resource =>
                        resource.data.name === this.config.customerResourceName
                )

                if (!customerResource) {
                    throw new Error(`The customer resource must be provided.`)
                }

                app.get(`/billing.js`, (request, response) =>
                    response.sendFile(
                        Path.resolve(__dirname, '..', 'client/app.js')
                    )
                )
                app.get(`/billing.css`, (request, response) =>
                    response.sendFile(
                        Path.resolve(__dirname, '..', 'client/app.css')
                    )
                )

                app.get(`/${this.config.portalPath}/`, async (request, response) =>
                    {
                        return response.send(
                            Mustache.render(indexFileContent, {
                                ...(await frontendState(this.config, request).get()),
                                name
                            })
                        )
                    }
                )
            })
    }
}

export const billing = () => new Hades()

export const plan = (name: string, slug?: string) => new Plan(name, slug)
