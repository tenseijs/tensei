import Qs from 'qs'
import Paginate from 'react-paginate'
import { Redirect } from 'react-router-dom'
import { throttle } from 'throttle-debounce'
import React, { useState, useCallback, useEffect } from 'react'
import {
    Table,
    SearchInput,
    Select,
    Button,
    Heading,
    ResourceContract,
    PaginatedData,
    AbstractData
} from '@tensei/components'

import ManageRole from './ManageRole'

export interface RolesProps {
    resource?: ResourceContract
}

const Roles: React.FC<RolesProps> = ({
    resource = window.Tensei.state.resourcesMap['admin-roles']
}) => {
    const [search, setSearch] = useState('')
    const [creating, setCreating] = useState(false)
    const [deleting, setDeleting] = useState<AbstractData | null>(null)
    const [editing, setEditing] = useState<AbstractData | null>(null)

    const fields = resource.fields.filter(field => field.showOnIndex)

    const searchableFields = resource.fields.filter(field => field.isSearchable)

    if (!window.Tensei.state.permissions[`index:${resource.slug}`]) {
        return <Redirect to={window.Tensei.getPath('404')} />
    }

    const getDefaultData = () => ({
        meta: {
            page: 1,
            per_page: resource.perPageOptions[0] || 10
        },
        data: [],
        sort: {}
    })

    const [data, setData] = useState<PaginatedData>(getDefaultData())

    const [loading, setLoading] = useState(true)

    const getSearchString = () => {
        const parameters: any = {
            [`${resource.slug}_page`]: data.meta.page,
            [`${resource.slug}_per_page`]: data.meta.per_page
        }

        if (data.sort?.field) {
            parameters[
                `${resource.slug}_sort`
            ] = `${data.sort?.field}___${data.sort?.direction}`
        }

        if (search) {
            parameters[`${resource.slug}_search`] = search
        }

        return Qs.stringify(parameters, { encodeValuesOnly: true })
    }

    const getQuery = () => {
        let parameters: any = {
            where: {}
        }

        if (search) {
            parameters.where._or = searchableFields.map(field => ({
                [field.inputName]: {
                    _like: `%${search}%`
                }
            }))
        }

        if (data.sort?.field) {
            parameters.sort = `${data.sort.field}:${data.sort.direction}`
        }

        parameters.page = data.meta.page
        parameters.per_page = data.meta.per_page
        parameters.populate =
            resource.slug === 'admin-roles'
                ? 'admin_permissions'
                : window.Tensei.state.config.pluginsConfig.auth.permission
                      .snakeCaseNamePlural

        return Qs.stringify(parameters, { encodeValuesOnly: true })
    }

    const fetchData = useCallback(
        throttle(
            700,
            (currentData: PaginatedData, slug: string, query: string) => {
                setLoading(true)

                window.Tensei.client
                    .get(`${slug}?${query}`)
                    .then(({ data: payload }) => {
                        setData({
                            ...currentData,
                            data: payload.data,
                            meta: payload.meta
                        })
                        setLoading(false)
                    })
            }
        ),
        []
    )

    useEffect(() => {
        fetchData(data, resource.slug, getQuery())
    }, [data.meta.per_page, data.meta.page, data.sort, search])

    const computePaginationValues = () => {
        const to = data.meta.per_page * data.meta.page

        return {
            from: data.meta.per_page * (data.meta.page - 1) + 1,
            to: data.meta.total && data.meta.total <= to ? data.meta.total : to,
            total: data.meta.total
        }
    }

    const paginationValues = computePaginationValues()

    const columns = [
        ...fields.map(field => ({
            title: field.name,
            field: field.inputName,
            sorter: field.isSortable,
            render: (value: string, row: any) => {
                const Component =
                    window.Tensei.components.index[field.component.index] ||
                    window.Tensei.components.index.Text

                return (
                    <Component
                        field={field}
                        values={row}
                        noLink={true}
                        value={row[field.inputName]}
                        resource={resource}
                    />
                )
            }
        })),
        (window.Tensei.state.permissions[`update:${resource.slug}`] ||
            window.Tensei.state.permissions[`delete:${resource.slug}`]) && {
            title: <span className="sr-only">View</span>,
            field: 'actions',

            render: (value: string, row: any) => (
                <div className="flex items-center">
                    {window.Tensei.state.permissions[
                        `update:${resource.slug}`
                    ] && (
                        <Button
                            onClick={() => setEditing(row)}
                            className="flex mr-4 items-center justify-center bg-tensei-gray-600 h-10 w-10 rounded-full opacity-80 hover:opacity-100 transition duration-100 ease-in-out"
                        >
                            <span className="sr-only">Edit</span>
                            <svg
                                className="fill-current text-tensei-gray-800"
                                width={16}
                                height={16}
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M0.25 10.9374V13.7499H3.0625L11.3575 5.45492L8.545 2.64242L0.25 10.9374ZM13.5325 3.27992C13.825 2.98742 13.825 2.51492 13.5325 2.22242L11.7775 0.467422C11.485 0.174922 11.0125 0.174922 10.72 0.467422L9.3475 1.83992L12.16 4.65242L13.5325 3.27992Z" />
                            </svg>
                        </Button>
                    )}
                    {window.Tensei.state.permissions[
                        `delete:${resource.slug}`
                    ] && (
                        <button
                            onClick={() => setDeleting(row)}
                            className="flex items-center justify-center bg-tensei-gray-600 h-10 w-10 rounded-full opacity-80 hover:opacity-100 transition duration-100 ease-in-out"
                        >
                            <span className="sr-only">Delete</span>
                            <svg
                                width={16}
                                height={16}
                                className="fill-current text-tensei-gray-800"
                                viewBox="0 0 12 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M1.5 12.25C1.5 13.075 2.175 13.75 3 13.75H9C9.825 13.75 10.5 13.075 10.5 12.25V3.25H1.5V12.25ZM11.25 1H8.625L7.875 0.25H4.125L3.375 1H0.75V2.5H11.25V1Z" />
                            </svg>
                        </button>
                    )}
                </div>
            )
        }
    ].filter(Boolean)

    return (
        <>
            <ManageRole
                editing={editing}
                resource={resource}
                setEditing={setEditing}
                onUpdate={() => fetchData(data, resource.slug, getQuery())}
                onDelete={() => fetchData(data, resource.slug, getQuery())}
                onCreate={() => fetchData(data, resource.slug, getQuery())}
                deleting={deleting}
                setDeleting={setDeleting}
                creating={creating}
                setCreating={setCreating}
            />
            <Heading as="h2" className="mb-5 text-2xl">
                {resource.label}
            </Heading>
            <div className="flex flex-wrap justify-between items-center w-full">
                <div className="flex flex-wrap w-full md:w-auto">
                    <SearchInput
                        className="md:mr-5 w-full mb-3 md:mb-0 md:w-96"
                        value={search || ''}
                        onChange={event => setSearch(event.target.value)}
                    />
                </div>

                <Button
                    onClick={() => setCreating(true)}
                    className="mt-3 md:mt-0"
                    primary
                >
                    Add {resource.name}
                </Button>
            </div>

            <div className="mt-8">
                <div className="flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="overflow-hidden border border-tensei-gray-600 rounded-lg">
                                <Table
                                    sort={data.sort}
                                    loading={loading}
                                    columns={columns as any[]}
                                    onSort={sort => setData({ ...data, sort })}
                                    rows={data.data as any}
                                    selection={{
                                        onChange: () => {}
                                    }}
                                    Empty={() => (
                                        <tr className="h-24">
                                            <td colSpan={columns.length + 1}>
                                                <div className="w-full h-full flex flex-col items-center justify-center my-8">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width={65}
                                                        height={51}
                                                        viewBox="0 0 65 51"
                                                        className="mb-4 text-tensei-gray-500 fill-current"
                                                    >
                                                        <path d="M56 40h2c.552285 0 1 .447715 1 1s-.447715 1-1 1h-2v2c0 .552285-.447715 1-1 1s-1-.447715-1-1v-2h-2c-.552285 0-1-.447715-1-1s.447715-1 1-1h2v-2c0-.552285.447715-1 1-1s1 .447715 1 1v2zm-5.364125-8H38v8h7.049375c.350333-3.528515 2.534789-6.517471 5.5865-8zm-5.5865 10H6c-3.313708 0-6-2.686292-6-6V6c0-3.313708 2.686292-6 6-6h44c3.313708 0 6 2.686292 6 6v25.049375C61.053323 31.5511 65 35.814652 65 41c0 5.522847-4.477153 10-10 10-5.185348 0-9.4489-3.946677-9.950625-9zM20 30h16v-8H20v8zm0 2v8h16v-8H20zm34-2v-8H38v8h16zM2 30h16v-8H2v8zm0 2v4c0 2.209139 1.790861 4 4 4h12v-8H2zm18-12h16v-8H20v8zm34 0v-8H38v8h16zM2 20h16v-8H2v8zm52-10V6c0-2.209139-1.790861-4-4-4H6C3.790861 2 2 3.790861 2 6v4h52zm1 39c4.418278 0 8-3.581722 8-8s-3.581722-8-8-8-8 3.581722-8 8 3.581722 8 8 8z" />
                                                    </svg>
                                                    <p>
                                                        No{' '}
                                                        {resource.name.toLowerCase()}{' '}
                                                        matched the given
                                                        criteria.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between">
                    <Select
                        className="w-full md:w-auto mb-3 md:mb-0"
                        roundedFull
                        hideFirstOption
                        options={
                            resource.perPageOptions?.map(option => ({
                                value: option,
                                label: `${option} / page`
                            })) || []
                        }
                        value={data.meta.per_page}
                        onChange={event =>
                            setData({
                                ...data,
                                meta: {
                                    ...data.meta,
                                    per_page: parseInt(event.target.value, 10)
                                }
                            })
                        }
                    />

                    {data?.meta?.total && data.meta.total > 0 ? (
                        <div className="hidden md:block">
                            <p className="">
                                Showing
                                <span className="font-medium mx-1">
                                    {paginationValues.from}
                                </span>
                                to
                                <span className="font-medium mx-1">
                                    {paginationValues.to}
                                </span>
                                of
                                <span className="font-medium mx-1">
                                    {paginationValues.total}
                                </span>
                                results
                            </p>
                        </div>
                    ) : null}

                    {loading &&
                    data.meta &&
                    data.meta.page &&
                    data.meta.total === 0 ? null : (
                        <Paginate
                            forcePage={data.meta.page - 1}
                            previousLabel={
                                <button className="mr-2 p-3 focus:outline-none focus:ring-2 border border-transparent focus:ring-tensei-primary rounded-lg">
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
                            }
                            nextLabel={
                                <button className="ml-2 p-3 focus:outline-none focus:ring-2 border border-transparent focus:ring-tensei-primary rounded-lg">
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
                            }
                            breakLabel={'...'}
                            breakClassName={'break-me'}
                            pageCount={data.meta.page_count!}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={({ selected }) => {
                                setData({
                                    ...data,
                                    meta: {
                                        ...data.meta,
                                        page: selected + 1
                                    }
                                })
                            }}
                            pageLinkClassName={
                                'cursor-pointer px-3 py-1 bg-transparent mr-2 rounded-lg focus:outline-none focus:ring-2 border border-transparent focus:ring-tensei-primary'
                            }
                            containerClassName={
                                'flex items-center justify-center w-full md:w-auto'
                            }
                            activeLinkClassName={
                                'rounded-lg px-3 text-white py-1 mr-2 font-semibold bg-tensei-primary'
                            }
                        />
                    )}
                </div>
            </div>
        </>
    )
}

export default Roles
