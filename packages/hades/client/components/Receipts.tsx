import React from 'react'

const Receipts: React.FC<{}> = () => {
    return (
        <div className="mt-3 sm:px-8">
            <div className="bg-white sm:rounded-lg shadow-sm divide-y divide-gray-100">
                <div className="flex items-center px-6 py-4">
                    <div className="text-sm  w-40">12 Feb 2021</div>

                    <div className="ml-10 w-40 text-sm">
                        <span v-html="receipt.amount"></span>
                    </div>

                    <div className="ml-10">
                        <a
                            className="underline text-sm text-gray-500"
                            href="#"
                            target="_blank"
                        >
                            View Receipt
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Receipts
