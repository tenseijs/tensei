import React from 'react'
import { Transition } from '@tensei/components'
interface PageWrapperProps {}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div className="py-6">
      <div className="max-w-full mx-auto px-6 sm:px-10 md:px-12">
        <Transition
          show={true}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {children}
        </Transition>
      </div>
    </div>
  )
}

export default PageWrapper
