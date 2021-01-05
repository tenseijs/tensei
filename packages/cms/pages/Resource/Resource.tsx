import Qs from 'qs'
import Paginate from 'react-paginate'
import { throttle } from 'throttle-debounce'
import { Link, useHistory, useLocation } from 'react-router-dom'
import React, { useState, useCallback, useEffect } from 'react'
import {
    Table,
    SearchInput,
    Select,
    ConfirmModal,
    Button,
    Heading,
    ResourceContract,
    PaginatedData
} from '@tensei/components'

export interface ResourceProps {
    resource: ResourceContract
}

const Resource: React.FC<ResourceProps> = ({ resource }) => {
    const history = useHistory()
    const location = useLocation()
    const [deleting, setDeleting] = useState<any>(null)

    const fields = resource.fields.filter(field => field.showOnIndex)

    const searchableFields = resource.fields.filter(field => field.isSearchable)

    const getDefaultParametersFromSearch = () => {
        const search = Qs.parse(location.search.split('?')[1])

        const sort = ((search[`${resource.slug}_sort`] as string) || '').split(
            '_'
        )

        return {
            page: search[`${resource.slug}_page`] || 1,
            per_page:
                search[`${resource.slug}_per_page`] ||
                resource.perPageOptions[0] ||
                10,
            search: search[`${resource.slug}_search`] || '',
            sort: sort
                ? {
                      field: sort[0],
                      direction: sort[1]
                  }
                : {}
        }
    }

    const defaultParams = getDefaultParametersFromSearch()

    const [data, setData] = useState<PaginatedData>({
        meta: {
            page: defaultParams.page as number,
            per_page: defaultParams.per_page as number
        },
        search: defaultParams.search as string,
        data: [],
        sort: defaultParams.sort as any
    })

    const [loading, setLoading] = useState(true)

    const getSearchString = () => {
        const parameters: any = {
            [`${resource.slug}_page`]: data.meta.page,
            [`${resource.slug}_per_page`]: data.meta.per_page
        }

        if (data.sort?.field) {
            parameters[
                `${resource.slug}_sort`
            ] = `${data.sort?.field}_${data.sort?.direction}`
        }

        if (data.search) {
            parameters[`${resource.slug}_search`] = data.search
        }

        return Qs.stringify(parameters, { encodeValuesOnly: true })
    }

    const getQuery = () => {
        let parameters: any = {
            where: {}
        }

        if (data.search) {
            parameters.where._or = searchableFields.map(field => ({
                [field.inputName]: {
                    _like: `%${data.search}%`
                }
            }))
        }

        if (data.sort?.field) {
            parameters.sort = `${data.sort.field}:${data.sort.direction}`
        }

        parameters.page = data.meta.page
        parameters.per_page = data.meta.per_page

        return Qs.stringify(parameters, { encodeValuesOnly: true })
    }

    const query = getQuery()

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
                            ...payload
                        })
                        setLoading(false)
                    })
            }
        ),
        []
    )

    useEffect(() => {
        fetchData(data, resource.slug, query)

        history.push({
            pathname: location.pathname,
            search: getSearchString()
        })
    }, [
        resource.slug,
        data.meta.per_page,
        data.meta.page,
        data.sort,
        data.search
    ])

    return (
        <>
            <ConfirmModal
                open={!!deleting}
                title="Delete Account?"
                setOpen={() => setDeleting(null)}
                description="Are you sure you want to delete this account? This action cannot be reversed."
            />
            <Heading as="h2" className="mb-5 text-2xl">
                {resource.label}
            </Heading>
            <div className="flex flex-wrap justify-between items-center w-full">
                <div className="flex flex-wrap w-full md:w-auto">
                    <SearchInput
                        className="md:mr-5 w-full mb-3 md:mb-0 md:w-96"
                        value={data.search || ''}
                        onChange={event =>
                            setData({
                                ...data,
                                search: event.target.value
                            })
                        }
                    />
                </div>

                <Link
                    to={window.Tensei.getPath(
                        `resources/${resource.slug}/create`
                    )}
                >
                    <Button className="mt-3 md:mt-0" primary>
                        Add {resource.name}
                    </Button>
                </Link>
            </div>

            <div className="mt-8">
                <div className="flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="overflow-hidden border border-tensei-gray-600 rounded-lg">
                                <Table
                                    sort={data.sort}
                                    loading={loading}
                                    onSort={sort => setData({ ...data, sort })}
                                    columns={[
                                        ...fields.map(field => ({
                                            title: field.name,
                                            field: field.inputName,
                                            sorter: field.isSortable,
                                            render: (
                                                value: string,
                                                row: any
                                            ) => {
                                                const Component =
                                                    window.Tensei.components
                                                        .index[
                                                        field.component.index
                                                    ] ||
                                                    window.Tensei.components
                                                        .index.Text

                                                return (
                                                    <Component
                                                        field={field}
                                                        values={row}
                                                        value={
                                                            row[field.inputName]
                                                        }
                                                        resource={resource}
                                                    />
                                                )
                                            }
                                        })),
                                        {
                                            title: (
                                                <span className="sr-only">
                                                    View
                                                </span>
                                            ),
                                            field: 'actions',

                                            render: (value, row) => (
                                                <div className="flex items-center">
                                                    <Link
                                                        to={window.Tensei.getPath(
                                                            'resources/books/123'
                                                        )}
                                                        className="flex mr-4 items-center justify-center bg-tensei-gray-300 h-8 w-8 rounded-full"
                                                    >
                                                        <span className="sr-only">
                                                            View resource
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
                                                    </Link>
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
                                    rows={data.data as any}
                                    selection={{
                                        onChange: () => {}
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between">
                    <Select
                        className="w-full md:w-auto mb-3 md:mb-0"
                        roundedFull
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

                    <div className="hidden md:block">
                        <p className="">
                            Showing
                            <span className="font-medium mx-1">
                                {data.meta.per_page * (data.meta.page - 1) + 1}
                            </span>
                            to
                            <span className="font-medium mx-1">
                                {data.meta.per_page * data.meta.page}
                            </span>
                            of
                            <span className="font-medium mx-1">
                                {data.meta.total}
                            </span>
                            results
                        </p>
                    </div>

                    {loading && data.meta && data.meta.page ? null : (
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

export default Resource
