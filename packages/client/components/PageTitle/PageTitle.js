import React from 'react'
import { TextInput } from '@contentful/forma-36-react-components'

const PageTitle = () => {
    return (
        <div className="w-full h-topbar border-b shadow px-3 border-gray-lighter flex items-center justify-between">
            <div className="flex items-center w-full md:w-18-percent">
                <svg
                    className="w-6 h-6 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                </svg>
                <span className="font-bold text-xl">Posts</span>
            </div>

            <div className="flex items-center w-full md:w-82-percent">
                <TextInput
                    width="large"
                    value={''}
                    onChange={console.log}
                    placeholder={`Type to search`}
                />
            </div>
        </div>
    )
}

export default PageTitle
