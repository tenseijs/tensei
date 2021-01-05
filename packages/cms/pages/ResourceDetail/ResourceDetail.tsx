import React, { useState, useEffect } from 'react'
import { RouteComponentProps, useParams, Redirect } from 'react-router-dom'
import {
    ConfirmModal,
    Heading,
    StackedList,
    Button,
    Pulse
} from '@tensei/components'

import Resource from '../Resource'
import PageWrapper from '../../components/PageWrapper'

export interface ResourceDetailProps {}

const ResourceDetail: React.FC<
    ResourceDetailProps &
        RouteComponentProps<{
            id: string
        }>
> = () => {
    const [data, setData] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<any>(null)

    const params = useParams<{
        id: string
        resource: string
    }>()

    const fetchData = () => {
        setData({})
        setLoading(true)

        window.Tensei.client
            .get(`${params.resource}/${params.id}`)
            .then(({ data }) => {
                setData(data.data)
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchData()
    }, [params.resource, params.id])

    const resource = window.Tensei.state.resourcesMap[params.resource]

    if (!resource) {
        return <Redirect to={window.Tensei.getPath('404')} />
    }

    const detailFields = resource.fields.filter(
        field => field.showOnDetail && !field.isRelationshipField
    )
    const relationshipDetailFields = resource.fields.filter(
        field => field.showOnDetail && field.isRelationshipField
    )

    const buildValues = (relationshipValues = false) => {
        const values: {
            [key: string]: any
        } = {}

        const fields = relationshipValues
            ? relationshipDetailFields
            : detailFields

        fields.forEach(field => {
            const Component =
                window.Tensei.components.detail[field.component.detail] ||
                window.Tensei.components.detail.Text

            values[field.inputName] = (
                <Component
                    field={field}
                    values={data}
                    value={data[field.inputName]}
                    resource={resource}
                />
            )
        })

        return values
    }

    return (
        <PageWrapper>
            {loading ? (
                <div className="w-full flex justify-center py-12">
                    <Pulse dotClassName="bg-tensei-primary" />
                </div>
            ) : (
                <>
                    <ConfirmModal
                        open={!!deleting}
                        title="Delete Account?"
                        setOpen={() => setDeleting(null)}
                        description="Are you sure you want to delete this account? This action cannot be reversed."
                    />
                    <header className="flex justify-between flex-wrap items-center mt-5">
                        <Heading className="text-2xl w-full md:w-auto" as="h1">
                            {resource.name} details:{' '}
                            {data[resource.displayFieldSnakeCase] ||
                                data[resource.displayField]}
                        </Heading>

                        <div className="flex justify-end mt-3 md:mt-0">
                            <Button danger>Delete</Button>
                            <Button primary className="ml-5">
                                Edit
                            </Button>
                        </div>
                    </header>

                    <div className="my-6">
                        <StackedList
                            fields={detailFields}
                            values={buildValues()}
                        />
                    </div>

                    {/* <Resource /> */}
                </>
            )}
        </PageWrapper>
    )
}

export default ResourceDetail
