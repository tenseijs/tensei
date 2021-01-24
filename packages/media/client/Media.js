import Qs from 'qs'
import { throttle } from 'throttle-debounce'
import React, { useState, useCallback, useEffect, Fragment } from 'react'
import {
    Button,
    Select,
    Heading,
    SearchInput,
    Pulse,
    Checkbox
} from '@tensei/components'

import UploadMedia from './UploadMedia'
const { PageWrapper, Paginator, DeleteModal } = window.Tensei.lib

import Card from './Card'

export const Media = ({ detailId, relatedResource }) => {
    const resource = window.Tensei.state.resourcesMap['files']

    const [selected, setSelected] = useState([])
    const [deleting, setDeleting] = useState(false)

    const relatedField = relatedResource
        ? relatedResource.fields.find(
              f =>
                  f.name === resource.name &&
                  ['OneToMany'].includes(f.fieldName)
          )
        : undefined

    const getDefaultParametersFromSearch = () => {
        const searchQuery = Qs.parse(location.search.split('?')[1])

        const sort = (searchQuery[`${resource.slug}_sort`] || '').split('___')

        return {
            page: searchQuery[`${resource.slug}_page`] || 1,
            per_page:
                searchQuery[`${resource.slug}_per_page`] ||
                resource.perPageOptions[0] ||
                10,
            sort: sort
                ? {
                      field: sort[0],
                      direction: sort[1]
                  }
                : {}
        }
    }

    const defaultParams = getDefaultParametersFromSearch()

    const getDefaultData = () => ({
        meta: {
            page: parseInt(defaultParams.page),
            per_page: parseInt(defaultParams.per_page)
        },
        data: [],
        sort: defaultParams.sort
    })

    const searchableFields = resource.fields.filter(field => field.isSearchable)

    const getQuery = () => {
        let parameters = {
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
            // parameters.sort = `${data.sort.field}:${data.sort.direction}`
        }

        parameters.page = data.meta.page
        parameters.per_page = data.meta.per_page
        parameters.populate = 'transformations'
        parameters.sort = `created_at:desc`
        parameters.where._and = [
            {
                file: {
                    _eq: null
                }
            }
        ]

        return Qs.stringify(parameters, {
            encodeValuesOnly: true,
            skipNulls: false
        })
    }

    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(getDefaultData())
    const [uploadOpen, setUploadOpen] = useState(false)

    const fetchData = useCallback(
        throttle(700, (currentData, query) => {
            setLoading(true)

            window.Tensei.client
                .get(
                    relatedResource
                        ? `${relatedResource.slug}/${detailId}/${relatedField.inputName}?${query}`
                        : `${resource.slug}?${query}`
                )
                .then(({ data: payload }) => {
                    setData({
                        ...currentData,
                        data: payload.data,
                        meta: payload.meta
                    })
                    setLoading(false)
                })
        }),
        []
    )

    useEffect(() => {
        fetchData(data, getQuery())
    }, [search, data.meta.page, data.meta.per_page])

    const onCheckboxChange = (row, event) => {
        if (event.target.checked) {
            setSelected([...selected, row])
        } else {
            setSelected(selected.filter(s => s.id !== row.id))
        }
    }

    const Wrapper = detailId ? Fragment : PageWrapper

    return (
        <Wrapper>
            <UploadMedia
                open={uploadOpen}
                detailId={detailId}
                setOpen={setUploadOpen}
                relatedResource={relatedResource}
                onUploaded={() => fetchData(data, getQuery())}
            />
            <DeleteModal
                open={deleting}
                resource={resource}
                selected={selected}
                setOpen={() => setDeleting(false)}
                onDelete={() => {
                    setSelected([])
                    fetchData(data, getQuery())
                }}
            />
            <Heading as="h2" className="mb-5 text-2xl">
                {detailId && relatedField
                    ? relatedField.label
                    : 'Media Library'}
            </Heading>

            <div className="flex flex-wrap justify-between items-center w-full">
                <div className="flex flex-wrap w-full md:w-auto">
                    <div className="mr-2 h-10 px-5 flex items-center justify-center bg-white rounded-lg border border-tensei-gray-600">
                        <Checkbox
                            onChange={event => {
                                if (event.target.checked) {
                                    setSelected(data.data)
                                } else {
                                    setSelected([])
                                }
                            }}
                            checked={
                                selected.length !== 0 &&
                                selected.length === data.data.length
                            }
                        />
                    </div>
                    <SearchInput
                        className="md:mr-5 w-full mb-3 md:mb-0 md:w-96"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                    />
                </div>

                <div className="flex w-full md:w-auto">
                    <Button
                        clear={selected.length === 0}
                        danger={selected.length > 0}
                        disabled={selected.length === 0}
                        onClick={() => setDeleting(true)}
                    >
                        Delete
                    </Button>
                    <Button
                        onClick={() => setUploadOpen(true)}
                        className="ml-3"
                        primary
                    >
                        Upload Assets
                    </Button>
                </div>
            </div>

            {!loading && data.data.length === 0 ? (
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
                        No {resource.name.toLowerCase()} matched the given
                        criteria.
                    </p>
                </div>
            ) : null}

            {loading ? (
                <div className="w-full py-12 flex justify-center items-center">
                    <Pulse dotClassName="bg-tensei-primary" />
                </div>
            ) : (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                    {data.data.map(file => {
                        const checked = selected.some(f => f.id === file.id)

                        return (
                            <Card
                                key={file.id}
                                file={file}
                                checked={checked}
                                onCheckboxChange={event =>
                                    onCheckboxChange(file, event)
                                }
                            />
                        )
                    })}
                </div>
            )}

            {!loading && data.data.length !== 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-between">
                    <Select
                        className="w-full md:w-auto mb-3 md:mb-0"
                        roundedFull
                        hideFirstOption
                        value={data.meta.per_page}
                        options={resource.perPageOptions.map(count => ({
                            label: `${count} / page`,
                            value: count
                        }))}
                        onChange={event =>
                            setData({
                                ...data,
                                meta: {
                                    ...data.meta,
                                    per_page: parseInt(event.target.value)
                                }
                            })
                        }
                    />

                    <Paginator
                        page={data.meta.page - 1}
                        page_count={data.meta.page_count}
                        onPageChange={({ selected }) => {
                            setData({
                                ...data,
                                meta: {
                                    ...data.meta,
                                    page: selected + 1
                                }
                            })
                        }}
                    />
                </div>
            )}
        </Wrapper>
    )
}
