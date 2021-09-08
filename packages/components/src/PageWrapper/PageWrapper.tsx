import cx from 'classnames'
import React, { ReactNode } from 'react'
import { Transition } from '@headlessui/react'

interface PageWrapperProps {
  noPadding?: boolean
  renderTopBarContent?: () => ReactNode
  renderDynamicSidebarContent?: () => ReactNode
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  noPadding = false,
  renderTopBarContent,
  renderDynamicSidebarContent
}) => {
  return (
    <>
      {renderDynamicSidebarContent ? renderDynamicSidebarContent() : null}
      <div className="w-full flex flex-col">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b px-6 border-tensei-gray-600">
          {renderTopBarContent ? renderTopBarContent() : null}
        </div>
        <main
          tabIndex={0}
          className="flex-1 relative overflow-y-auto overflow-x-hidden focus:outline-none"
        >
          <div className="w-full h-full py-6">
            <div
              className={cx('max-w-full mx-auto', {
                'px-6': !noPadding
              })}
            >
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
        </main>
      </div>
    </>
  )
}

export default PageWrapper
