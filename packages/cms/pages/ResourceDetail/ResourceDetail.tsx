import React, { useState, useEffect } from 'react'
import {
    RouteComponentProps,
    useParams,
    Redirect,
    useHistory,
    Link
} from 'react-router-dom'
import { Heading, StackedList, Button, Pulse } from '@tensei/components'

import PageWrapper from '../../components/PageWrapper'
import DeleteModal from '../../components/DeleteModal'

export interface ResourceDetailProps {}

const ResourceDetail: React.FC<
    ResourceDetailProps &
        RouteComponentProps<{
            id: string
        }>
> = () => {
    const history = useHistory()
    const [data, setData] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<boolean>(false)

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
            .catch(error => {
                history.push(
                    window.Tensei.getPath(`resources/${params.resource}`)
                )
                window.Tensei.error(
                    error?.response?.data?.error ||
                        `Could not fetch ${resource.name} with ID of ${params.id}.`
                )
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
        field => field.showOnDetail && !field.showOnPanel
    )

    const panelFields = resource.fields.filter(
        field => field.showOnDetail && field.showOnPanel
    )

    const buildValues = (relationshipValues = false) => {
        const values: {
            [key: string]: any
        } = {}

        const fields = relationshipValues ? panelFields : detailFields

        fields.forEach(field => {
            const Component =
                window.Tensei.components.detail[field.component.detail] ||
                window.Tensei.components.detail.Text

            values[field.inputName] = (
                <Component
                    field={field}
                    values={data}
                    detailId={params.id}
                    resource={resource}
                    value={data[field.inputName]}
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
                    <DeleteModal
                        open={!!deleting}
                        resource={resource}
                        selected={[data]}
                        leavesPage
                        setOpen={() => setDeleting(!deleting)}
                        onDelete={() =>
                            history.push(
                                window.Tensei.getPath(
                                    `resources/${resource.slug}`
                                )
                            )
                        }
                    />
                    <header className="flex justify-between flex-wrap items-center mt-5">
                        <Heading className="text-2xl w-full md:w-auto" as="h1">
                            {resource.name} details:{' '}
                            {data[resource.displayFieldSnakeCase] ||
                                data[resource.displayField]}
                        </Heading>

                        <div className="flex justify-end mt-3 md:mt-0">
                            <Button onClick={() => setDeleting(true)} clear>
                                Delete
                            </Button>
                            <Link
                                to={window.Tensei.getPath(
                                    `resources/${resource.slug}/${params.id}/update`
                                )}
                            >
                                <Button primary className="ml-5">
                                    Edit
                                </Button>
                            </Link>
                        </div>
                    </header>

                    <div className="my-6">
                        <StackedList
                            fields={detailFields}
                            values={buildValues()}
                        />
                    </div>

                    {panelFields.map(field => {
                        const Component =
                            window.Tensei.components.detail[
                                field.component.detail
                            ]

                        if (!Component) {
                            return null
                        }

                        return (
                            <div key={field.inputName} className="mb-6">
                                <Component
                                    field={field}
                                    values={data}
                                    resource={resource}
                                    detailId={params.id}
                                    key={field.inputName}
                                    value={data[field.inputName]}
                                />
                            </div>
                        )
                    })}
                </>
            )}
        </PageWrapper>
    )
}

export default ResourceDetail
