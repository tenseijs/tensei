import React from 'react'
import ReactDOM from 'react-dom'
import { PageWrapper } from '@tensei/components'

import Plans from './components/Plans'
import Button from './components/Button'
import Receipts from './components/Receipts'
import SectionHeading from './components/SectionHeading'

const getDefaultState = () => {
    const thisWindow = (window as any)
    return {
        plans: JSON.parse(thisWindow.__tensei__billing.plans)
    }
}

const Hades = () => {
    const state = getDefaultState()

    console.log(state)

    return (
        <div className="font-sans antialiased min-h-screen bg-gray-100">
            <div className="min-h-screen flex">
                <div className="hidden lg:block w-96 pt-24 px-6 bg-white shadow-lg">
                    {/* <div className="max-w-md">
                        </div> */}

                    <h1 className="text-3xl font-bold text-gray-900">Tensei</h1>

                    <div className="mt-1 text-lg font-semibold text-gray-700">
                        Billing Management
                    </div>

                    <div className="flex items-center mt-12 text-gray-600">
                        <div>Signed in as</div>

                        {/* <img className="ml-2 h-6 w-6 rounded-full" v-if="$page.props.userAvatar" /> */}

                        <div className="ml-1 __ml-2">Bahdcoder</div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                        Managing billing for Users
                    </div>

                    <div className="mt-12 text-gray-600">
                        Our billing management portal allows you to conveniently
                        manage your subscription plan, payment method, and
                        download your recent invoices.
                    </div>

                    <div className="mt-12">
                        <a href="" className="flex items-center">
                            <svg
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="arrow-left w-5 h-5 text-gray-400"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>

                            <div className="ml-2 text-gray-600 underline">
                                Return to app
                            </div>
                        </a>
                    </div>
                </div>

                <div className="flex-1">
                    <a
                        href="#"
                        className="lg:hidden flex items-center w-full px-4 py-4 bg-white shadow-lg"
                    >
                        <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="arrow-left w-4 h-4 text-gray-400"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                clipRule="evenodd"
                            ></path>
                        </svg>

                        <div className="ml-2 text-gray-600 underline">
                            Return To app
                        </div>
                    </a>

                    <div className="mb-6 pt-6 lg:pt-24 lg:max-w-4xl lg:mx-auto">
                        {/* <error-messages className="mb-10 sm:px-8" :errors="errors" v-if="errors.length > 0" /> */}

                        <SectionHeading className="px-4 sm:px-8">
                            Subscribe
                        </SectionHeading>

                        <div className="mt-6 sm:px-8">
                            <div className="px-6 py-4 bg-gray-200 border border-gray-300 sm:rounded-lg shadow-sm">
                                <div className="max-w-2xl text-sm text-gray-600">
                                    It looks like you do not have an active
                                    subscription. You may choose one of the
                                    subscription plans below to get started.
                                    Subscription plans may be changed or
                                    cancelled at your convenience.
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="flex items-center px-4 sm:px-8">
                                <SectionHeading>
                                    Subscription Pending
                                </SectionHeading>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="ml-2 text-gray-300 h-6 w-6 animate-spin"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" />
                                    <path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5" />
                                </svg>
                            </div>

                            <div className="mt-3 sm:px-8">
                                <div className="px-6 py-4 bg-white sm:rounded-lg shadow-sm">
                                    <div className="max-w-2xl text-sm text-gray-600">
                                        We are processing your subscription.
                                        Once the subscription has successfully
                                        processed, this page will update
                                        automatically. Typically, this process
                                        should only take a few seconds.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <SectionHeading className="px-4 sm:px-8">
                                Subscribe
                            </SectionHeading>

                            <div className="mt-6 sm:px-8">
                                <div className="px-6 py-4 bg-gray-200 border border-gray-300 sm:rounded-lg shadow-sm">
                                    <div className="max-w-2xl text-sm text-gray-600">
                                        It looks like you do not have an active
                                        subscription. You may choose one of the
                                        subscription plans below to get started.
                                        Subscription plans may be changed or
                                        cancelled at your convenience.
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 px-4 sm:px-8">
                                <Plans />
                            </div>

                            <SectionHeading className="mt-10 px-4 sm:px-8">
                                Payment Method
                            </SectionHeading>

                            <div className="mt-3 sm:px-8">
                                <div className="px-6 py-4 bg-white sm:rounded-lg shadow-sm">
                                    <div className="max-w-2xl text-sm text-gray-600">
                                        Your current payment method is a credit
                                        card ending in{' '}
                                        <span className="font-semibold">
                                            3434
                                        </span>{' '}
                                        that expires on{' '}
                                        <span className="font-semibold">
                                            09/22
                                        </span>
                                        .
                                    </div>

                                    {/* <div className="max-w-2xl text-sm text-gray-600">
                                    Your current payment method is <span className="font-semibold">PayPal</span>
                                </div> */}

                                    <Button className="mt-4">
                                        Update Payment Method
                                    </Button>
                                </div>
                            </div>

                            <SectionHeading className="mt-10 px-4 sm:px-8">
                                Cancel Subscription
                            </SectionHeading>

                            <div className="mt-3 sm:px-8">
                                <div className="px-6 py-4 bg-white sm:rounded-lg shadow-sm">
                                    <div className="max-w-2xl text-sm text-gray-600">
                                        You may cancel your subscription at any
                                        time. Once your subscription has been
                                        cancelled, you will have the option to
                                        resume the subscription until the end of
                                        your current billing cycle.
                                    </div>

                                    <div className="mt-4">
                                        <Button>Cancel Subscription</Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='mt-10'>
                            <SectionHeading className="px-4 sm:px-8">
                                Resume Subscription
                            </SectionHeading>

                            <div className="mt-3 sm:px-8">
                                <div className="px-6 py-4 bg-white sm:rounded-lg shadow-sm">
                                    <div className="max-w-2xl text-sm text-gray-600">
                                        Having second thoughts about cancelling
                                        your subscription? You can instantly
                                        reactive your subscription at any time
                                        until the end of your current billing
                                        cycle. After your current billing cycle
                                        ends, you may choose an entirely new
                                        subscription plan.
                                    </div>

                                    <div className="mt-4">
                                        <Button>Resume Subscription</Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <SectionHeading className="px-4 sm:px-8">
                                Receipts
                            </SectionHeading>

                            <Receipts />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

ReactDOM.render(<Hades />, document.getElementById('portal'))
