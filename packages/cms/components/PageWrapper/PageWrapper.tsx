import React from 'react'

interface PageWrapperProps {}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
    return (
        <div className="py-6">
            <div className="max-w-full mx-auto px-6 sm:px-10 md:px-12">
                {children}
            </div>
        </div>
    )
}

export default PageWrapper
