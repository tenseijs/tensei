import React, { Fragment } from 'react'
import cx from 'classnames'
import { Menu, Transition } from '@headlessui/react'

interface ActionButtonAction {
  onClick: () => void
  title: string
}

export interface ActionButtonProps {
  actions: ActionButtonAction[]
}

export const ActionButton: React.FC<ActionButtonProps> = ({ actions }) => {
  return (
    <span className="relative z-0 inline-flex shadow-sm rounded">
      <button
        type="button"
        className="h-8 flex items-center text-13px font-medium px-3 relative inline-flex items-center text-white border border-tensei-primary rounded-l text-tensei-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tensei-primary transition ease-in-out0"
      >
        Actions
      </button>
      <Menu as="span" className="-ml-px relative block">
        <Menu.Button className="relative inline-flex items-center px-2 h-8 rounded-r border border-tensei-primary bg-white text-sm font-medium text-tensei-primary focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tensei-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span className="sr-only">Open options</span>
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="origin-top-right absolute right-0 mt-2 -mr-1 w-48 px-2 py-1 rounded shadow bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {actions.map(item => (
                <Menu.Item key={item.title}>
                  {({ active }) => (
                    <button
                      onClick={item.onClick}
                      className={cx(
                        active
                          ? 'w-full text-left font-medium bg-tensei-primary bg-opacity-15 text-tensei-primary rounded'
                          : '',
                        'w-full text-left block px-4 py-2 text-sm'
                      )}
                    >
                      {item.title}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </span>
  )
}

export default ActionButton
