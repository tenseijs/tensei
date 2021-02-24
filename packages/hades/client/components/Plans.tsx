import React from 'react'
import Button from './Button'
import Feature from './Feature'

const Plans: React.FC<{
    className?: string
}> = ({ children, className }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white sm:rounded-lg shadow-sm overflow-hidden">
                <div>
                    <div className="flex justify-between">
                        <h2 className="px-6 pt-4 text-xl font-semibold text-gray-700">
                            Plan name
                        </h2>

                        <div className="h-1/2 px-4 py-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded-bl-md">
                            Incentive here
                        </div>
                    </div>

                    <div className="px-6 pb-4">
                        <div className="mt-2 text-md font-semibold text-gray-700">
                            <span>$9 / month</span>
                        </div>

                        <div className="mt-3 max-w-xl text-sm text-gray-600">
                            Some short name
                        </div>

                        <div className="mt-3 space-y-2">
                            <Feature />
                            <Feature />
                            <Feature />
                            <Feature />
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
        </div>
    )
}

export default Plans
