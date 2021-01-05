import Qs from 'qs'
import { throttle, debounce } from 'throttle-debounce'
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { ConfirmModal, PaginatedData } from '@tensei/components'

import Resource from '../Resource'
import PageWrapper from '../../components/PageWrapper'

export interface ResourceIndexProps {}

const ResourceIndex: React.FC<ResourceIndexProps> = () => {
    const params = useParams<{
        resource: string
    }>()

    const resource = window.Tensei.state.resourcesMap[params.resource]

    if (!resource) {
        return <Redirect to={window.Tensei.getPath('404')} />
    }

    const [data, setData] = useState<PaginatedData>({
        meta: {
            page: 1,
            per_page: resource.perPageOptions[0] || 10
        },
        search: '',
        data: []
    })
    const [sort, setSort] = useState<{
        field?: string
        direction?: 'asc' | 'desc'
    }>({})
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<any>(null)

    const searchableFields = resource.fields.filter(f => f.isSearchable)

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

        if (sort.field) {
            parameters.sort = `${sort.field}:${sort.direction}`
        }

        parameters.page = data.meta.page
        parameters.per_page = data.meta.per_page

        console.log(parameters)

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
        fetchData(data, params.resource, query)
    }, [params.resource, data.meta.per_page, data.meta.page, sort, data.search])

    return (
        <PageWrapper>
            <ConfirmModal
                open={!!deleting}
                title="Delete Account?"
                setOpen={() => setDeleting(null)}
                description="Are you sure you want to delete this account? This action cannot be reversed."
            />

            <Resource resource={resource} />
        </PageWrapper>
    )
}

export default ResourceIndex
