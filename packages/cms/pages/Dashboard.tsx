import React, { useState } from 'react'
import { Transition, Menu } from '@tensei/components'

import Nav from '../components/Nav'
import Resource from './Resource'
import ResourceDetail from './ShowResource'
import CreateResource from './CreateResource'

export interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
    const [offCanvasOpen, setOffCanvasOpen] = useState(false)

    return (
        <>
            <div className="h-screen flex overflow-hidden bg-tensei-gray-100">
                {/* Off-canvas menu for mobile, show/hide based on off-canvas menu state. */}
                <Transition show={offCanvasOpen} className="md:hidden">
                    <div className="fixed inset-0 flex z-40">
                        <Transition.Child
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            {ref => (
                                <div
                                    ref={ref}
                                    className="fixed inset-0"
                                    aria-hidden={!offCanvasOpen}
                                >
                                    <div className="absolute inset-0 bg-gray-600 opacity-75" />
                                </div>
                            )}
                        </Transition.Child>
                        <Transition.Child
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            {ref => (
                                <div
                                    ref={ref}
                                    className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-tensei-darkest"
                                >
                                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                                        <button
                                            onClick={() =>
                                                setOffCanvasOpen(!offCanvasOpen)
                                            }
                                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                        >
                                            <span className="sr-only">
                                                Close sidebar
                                            </span>
                                            {/* Heroicon name: x */}
                                            <svg
                                                className="h-6 w-6 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex-shrink-0 flex items-center px-4">
                                        <div className="flex items-center justify-start pl-6 h-12 rounded-lg bg-white w-full">
                                            <img
                                                className="h-6 w-auto"
                                                src="https://res.cloudinary.com/bahdcoder/image/upload/v1604236130/Asset_1_4x_fhcfyg.png"
                                                alt="Tensei"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-5 flex-1 h-0 overflow-y-auto">
                                        <Nav className="px-2 space-y-1" />
                                    </div>
                                </div>
                            )}
                        </Transition.Child>
                        <div className="flex-shrink-0 w-14" aria-hidden="true">
                            {/* Dummy element to force sidebar to shrink to fit close icon */}
                        </div>
                    </div>
                </Transition>
                {/* Static sidebar for desktop */}
                <div className="hidden bg-tensei-darkest md:flex md:flex-shrink-0">
                    <div className="flex flex-col w-64">
                        {/* Sidebar component, swap this element with another sidebar if you like */}
                        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0 px-4">
                                <div className="flex items-center justify-start pl-6 h-12 rounded-lg bg-white w-full">
                                    <img
                                        className="h-6 w-auto"
                                        src="https://res.cloudinary.com/bahdcoder/image/upload/v1604236130/Asset_1_4x_fhcfyg.png"
                                        alt="Tensei"
                                    />
                                </div>
                            </div>
                            <div className="mt-5 flex-1 flex flex-col">
                                <Nav className="flex-1 space-y-1 mt-3" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col w-0 flex-1 overflow-hidden">
                    <div className="relative z-10 flex-shrink-0 flex h-20 bg-white border-b border-tensei-gray-800">
                        <button
                            onClick={() => {
                                setOffCanvasOpen(!offCanvasOpen)
                            }}
                            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
                        >
                            <span className="sr-only">Open sidebar</span>
                            {/* Heroicon name: menu-alt-2 */}
                            <svg
                                className="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h7"
                                />
                            </svg>
                        </button>
                        <div className="flex-1 px-8 flex justify-between">
                            <div className="flex-1 flex items-center">
                                <h2 className="text-tensei-darkest font-bold">
                                    Main Dashboard
                                </h2>
                            </div>
                            <div className="ml-4 flex items-center md:ml-6">
                                {/* Profile dropdown */}
                                <div className="relative inline-block text-left">
                                    <Menu>
                                        {({ open }) => (
                                            <>
                                                <span className="rounded-md shadow-sm">
                                                    <Menu.Button
                                                        className={`max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tensei-primary`}
                                                    >
                                                        <span className="sr-only">
                                                            Open user menu
                                                        </span>
                                                        <img
                                                            className="h-10 w-10 rounded-full"
                                                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                            alt=""
                                                        />
                                                    </Menu.Button>
                                                </span>

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
                                                        className="absolute right-0 w-56 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-lg shadow-sm outline-none"
                                                    >
                                                        <div className="px-4 py-3">
                                                            <p className="text-sm leading-5">
                                                                Signed in as
                                                            </p>
                                                            <p className="text-sm font-medium leading-5 text-gray-900 truncate">
                                                                tom@example.com
                                                            </p>
                                                        </div>

                                                        <div className="py-1">
                                                            <Menu.Item>
                                                                {({
                                                                    active
                                                                }) => (
                                                                    <a
                                                                        href="#account-settings"
                                                                        className={`${
                                                                            active
                                                                                ? 'bg-gray-100 text-gray-900'
                                                                                : 'text-gray-700'
                                                                        } flex justify-between w-full px-4 py-2 text-sm leading-5 text-left`}
                                                                    >
                                                                        Account
                                                                        settings
                                                                    </a>
                                                                )}
                                                            </Menu.Item>
                                                        </div>

                                                        <div className="py-1">
                                                            <Menu.Item>
                                                                {({
                                                                    active
                                                                }) => (
                                                                    <a
                                                                        href="#sign-out"
                                                                        className={`${
                                                                            active
                                                                                ? 'bg-gray-100 text-gray-900'
                                                                                : 'text-gray-700'
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
                            </div>
                        </div>
                    </div>
                    <main
                        tabIndex={0}
                        className="flex-1 relative overflow-y-auto focus:outline-none"
                    >
                        <div className="py-6">
                            <div className="max-w-full mx-auto px-6 sm:px-10 md:px-12">
                                {/* Replace with your content */}
                                <ResourceDetail />
                                {/* /End replace */}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}

export default Dashboard
