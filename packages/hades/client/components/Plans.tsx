import React, { useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'

import Button from './Button'
import Feature from './Feature'

import { Plan } from '../types'

const Plans: React.FC<{
    className?: string
    plans: Plan[]
    planInterval: 'monthly' | 'yearly'
}> = ({ plans, planInterval }) => {
    return (
        <div className="space-y-6">
            {plans.map(plan => {
                const planIntervalDetails = planInterval == 'monthly' ? {
                    incentive: plan.monthlyIncentive,
                    price: plan.monthlyPrice?.price?.gross,
                    per: 'month'
                } : {
                    incentive: plan.yearlyIncentive,
                    price: plan.yearlyPrice?.price?.gross,
                    per: 'yearly'
                }

                return <div className="bg-white sm:rounded-lg shadow-sm overflow-hidden" key={plan.slug}>
                    <div>
                        <div className="flex justify-between">
                            <h2 className="px-6 pt-4 text-xl font-semibold text-gray-700">
                                {plan.name}
                            </h2>

                            {planIntervalDetails.incentive ? (
                                <div className="h-1/2 px-4 py-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded-bl-md">
                                {planIntervalDetails.incentive}
                                </div>
                            ) : null}
                        </div>

                        <div className="px-6 pb-4">
                            <div className="mt-2 text-md font-semibold text-gray-700">
                                <span>${planIntervalDetails.price} / {planIntervalDetails.per}</span>
                            </div>

                            <div className="mt-3 max-w-xl text-sm text-gray-600">
                                {plan.description}
                            </div>

                            <div className="mt-3 space-y-2">
                                {plan.features.map(feature => <Feature key={feature} feature={feature} />)}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-100 bg-opacity-50 border-t border-gray-100 text-right">
                        <Button>Subscribe</Button>

                        {/* <div className="flex justify-end items-center">
                        <div className="ml-1 text-sm text-gray-400">Currently Subscribed</div>
                    </div> */}
                    </div>
                </div>
            })}
        </div>
    )
}

export default Plans
