import React from 'react'
import { Transition, Menu } from '@tensei/components'

export interface ActionsProps {}

const Actions: React.FC<ActionsProps> = ({}) => {
  return (
    <div className="relative inline-block">
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button className="flex mr-4 items-center justify-center bg-tensei-gray-300 h-8 w-8 rounded-full">
              <span className="sr-only">Actions</span>
              <svg
                width={14}
                height={14}
                className="fill-current text-tensei-gray-700"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2.16667 10.1668C3.36328 10.1668 4.33333 9.19678 4.33333 8.00016C4.33333 6.80355 3.36328 5.8335 2.16667 5.8335C0.97005 5.8335 0 6.80355 0 8.00016C0 9.19678 0.97005 10.1668 2.16667 10.1668Z" />
                <path d="M8.00004 10.1668C9.19666 10.1668 10.1667 9.19678 10.1667 8.00016C10.1667 6.80355 9.19666 5.8335 8.00004 5.8335C6.80342 5.8335 5.83337 6.80355 5.83337 8.00016C5.83337 9.19678 6.80342 10.1668 8.00004 10.1668Z" />
                <path d="M13.8333 10.1668C15.0299 10.1668 16 9.19678 16 8.00016C16 6.80355 15.0299 5.8335 13.8333 5.8335C12.6367 5.8335 11.6666 6.80355 11.6666 8.00016C11.6666 9.19678 12.6367 10.1668 13.8333 10.1668Z" />
              </svg>
            </Menu.Button>

            <Transition
              show={open}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                static
                className="z-50 absolute right-0 w-56 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-lg shadow-sm outline-none"
              >
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#account-settings"
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } flex justify-between w-full px-4 py-2 text-sm leading-5 text-left`}
                      >
                        Account settings
                      </a>
                    )}
                  </Menu.Item>
                </div>

                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#sign-out"
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } flex justify-between w-full px-4 py-2 text-sm leading-5 text-left`}
                      >
                        Sign out
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  )
}

export default Actions
