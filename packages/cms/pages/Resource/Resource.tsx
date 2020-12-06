import React, { useState } from 'react'
import {
    Table,
    SearchInput,
    Select,
    ConfirmModal,
    Button
} from '@tensei/components'

import Actions from '../../components/Actions'

export interface ResourceProps {}

const Resource: React.FC<ResourceProps> = ({}) => {
    const [deleting, setDeleting] = useState<any>(null)

    return (
        <>
            <ConfirmModal
                open={!!deleting}
                setOpen={() => setDeleting(null)}
                title="Delete Account?"
                description="Are you sure you want to delete this account? This action cannot be reversed."
            />
            <div className="flex flex-wrap justify-between items-center w-full">
                <div className="flex flex-wrap w-full md:w-auto">
                    <SearchInput className="md:mr-5 w-full mb-3 md:mb-0 md:w-96" />

                    <Button clear>
                        <span className="flex items-center px-3 text-tensei-gray-700">
                            Filter
                            <svg
                                width={16}
                                height={14}
                                className="ml-4 text-tensei-gray-700 "
                                viewBox="0 0 16 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect
                                    x={9}
                                    y={1}
                                    width={7}
                                    height={2}
                                    fill="currentColor"
                                />
                                <rect
                                    x={9}
                                    y={1}
                                    width={7}
                                    height={2}
                                    fill="currentColor"
                                />
                                <rect
                                    y={6}
                                    width={9}
                                    height={2}
                                    fill="currentColor"
                                />
                                <rect
                                    y={1}
                                    width={5}
                                    height={2}
                                    fill="currentColor"
                                />
                                <rect
                                    x={11}
                                    y={6}
                                    width={5}
                                    height={2}
                                    fill="currentColor"
                                />
                                <rect
                                    y={11}
                                    width={4}
                                    height={2}
                                    fill="currentColor"
                                />
                                <rect
                                    x={6}
                                    y={11}
                                    width={10}
                                    height={2}
                                    fill="currentColor"
                                />
                                <rect
                                    x={7}
                                    width={2}
                                    height={4}
                                    fill="currentColor"
                                />
                                <rect
                                    x={11}
                                    y={5}
                                    width={2}
                                    height={4}
                                    fill="currentColor"
                                />
                                <rect
                                    x={6}
                                    y={10}
                                    width={2}
                                    height={4}
                                    fill="currentColor"
                                />
                            </svg>
                        </span>
                    </Button>
                </div>

                <Button primary>Add Resource</Button>
            </div>

            <div className="mt-8">
                <div className="flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="shadow-sm overflow-hidden border-b border-tensei-gray-800 sm:rounded-sm">
                                <Table
                                    columns={[
                                        {
                                            title: 'Name',
                                            field: 'name',
                                            sorter: false
                                        },
                                        {
                                            title: 'Title',
                                            field: 'title'
                                        },
                                        {
                                            title: 'Email',
                                            field: 'email'
                                        },
                                        {
                                            title: 'Role',
                                            field: 'role'
                                        },
                                        {
                                            title: (
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            ),
                                            field: 'actions',
                                            className: 'relative px-6 py-3',

                                            render: (value, row) => (
                                                <div className="flex items-center">
                                                    <Actions />
                                                    <button className="flex mr-4 items-center justify-center bg-tensei-gray-300 h-8 w-8 rounded-full">
                                                        <span className="sr-only">
                                                            Edit
                                                        </span>
                                                        <svg
                                                            className="fill-current text-tensei-gray-700"
                                                            width={14}
                                                            height={14}
                                                            viewBox="0 0 14 14"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path d="M0.25 10.9374V13.7499H3.0625L11.3575 5.45492L8.545 2.64242L0.25 10.9374ZM13.5325 3.27992C13.825 2.98742 13.825 2.51492 13.5325 2.22242L11.7775 0.467422C11.485 0.174922 11.0125 0.174922 10.72 0.467422L9.3475 1.83992L12.16 4.65242L13.5325 3.27992Z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setDeleting(row)
                                                        }
                                                        className="flex items-center justify-center bg-tensei-gray-300 h-8 w-8 rounded-full"
                                                    >
                                                        <span className="sr-only">
                                                            Delete
                                                        </span>
                                                        <svg
                                                            width={14}
                                                            height={14}
                                                            className="fill-current text-tensei-gray-700"
                                                            viewBox="0 0 12 14"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path d="M1.5 12.25C1.5 13.075 2.175 13.75 3 13.75H9C9.825 13.75 10.5 13.075 10.5 12.25V3.25H1.5V12.25ZM11.25 1H8.625L7.875 0.25H4.125L3.375 1H0.75V2.5H11.25V1Z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )
                                        }
                                    ]}
                                    rows={Array.from(Array(5).keys()).map(
                                        n => ({
                                            id: n.toString(),
                                            name: 'Kati Frantz',
                                            title: 'Product manager',
                                            email: 'tom@example.com',
                                            role: 'Manager'
                                        })
                                    )}
                                    selection={{
                                        onChange: console.log
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <Select />

                    <div className="hidden sm:block">
                        <p className="text-sm">
                            Showing
                            <span className="font-medium mx-1">1</span>
                            to
                            <span className="font-medium mx-1">10</span>
                            of
                            <span className="font-medium mx-1">20</span>
                            results
                        </p>
                    </div>

                    <nav className="flex items-center">
                        <button className="mr-2 p-3 focus:outline-none focus:ring-2 border border-transparent focus:ring-tensei-primary rounded-sm">
                            <svg
                                className="fill-current"
                                width={10}
                                height={10}
                                viewBox="0 0 6 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M6 1.2833L2.2915 4.9999L6 8.7165L4.8583 9.8582L-2.12363e-07 4.9999L4.8583 0.141602L6 1.2833Z" />
                            </svg>
                        </button>

                        <a
                            href=""
                            className="rounded-sm px-3 py-1 mr-2 font-semibold bg-tensei-primary text-white focus:outline-none border border-transparent focus:ring-offset-2 focus:ring-2 focus:ring-tensei-primary"
                        >
                            1
                        </a>

                        <a
                            href="#"
                            className="px-3 py-1 bg-transparent mr-2 rounded-sm focus:outline-none focus:ring-2 border border-transparent focus:ring-tensei-primary"
                        >
                            2
                        </a>
                        <a
                            href="#"
                            className="px-3 py-1 bg-transparent rounded-sm focus:outline-none focus:ring-2 border border-transparent focus:ring-tensei-primary"
                        >
                            3
                        </a>

                        <button className="ml-2 p-3 focus:outline-none focus:ring-2 border border-transparent focus:ring-tensei-primary rounded-sm">
                            <svg
                                className="fill-current transform rotate-180"
                                width={10}
                                height={10}
                                viewBox="0 0 6 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M6 1.2833L2.2915 4.9999L6 8.7165L4.8583 9.8582L-2.12363e-07 4.9999L4.8583 0.141602L6 1.2833Z" />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </>
    )
}

export default Resource
