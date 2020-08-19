import cn from 'classnames'
import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
    Heading,
    Button,
    Card,
    Paragraph,
} from '@contentful/forma-36-react-components'
import { withResources } from '~/store/resources'
import ActionsDropdown from '~/components/ActionsDropdown'

class ShowResource extends React.Component {
    state = this.defaultState()

    defaultState() {
        return {
            model: null,
            loading: true,
            resource: this.findResource(),
        }
    }

    findResource() {
        return this.props.resources.find(
            (resource) => resource.slug === this.props.match.params.resource
        )
    }

    getShowFields() {
        return this.getNonRelationalFields().map((field) => field.inputName)
    }

    componentDidMount() {
        this.bootComponent()
    }

    bootComponent = () => {
        this.setState(
            {
                model: null,
                loading: true,
                resource: this.findResource(),
            },
            () => this.fetchResource()
        )
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.match.params.resource !== this.props.match.params.resource
        ) {
            this.bootComponent()
        }
    }

    fetchResource() {
        const { resource } = this.state
        const { resourceId } = this.props.match.params

        Flamingo.request
            .get(
                `resources/${
                    resource.slug
                }/${resourceId}?fields=${this.getShowFields().join(',')}`
            )

            .then(({ data }) => {
                this.setState({
                    model: data,
                    loading: false,
                })
            })

            .catch(() => {
                this.setState({
                    loading: false,
                })

                Flamingo.library.Notification.error(
                    `Could not find resource with ID. ${resourceId}`
                )

                this.props.history.push(
                    Flamingo.getPath(`resources/${resource.slug}`)
                )
            })
    }

    renderResourceField(field) {
        const { resource, loading, model } = this.state
        if (loading || !model) {
            return null
        }

        const Component = Flamingo.detailFieldComponents[field.component]

        if (!Component) {
            return null
        }

        const fieldValue = model[field.inputName]

        return (
            <Component
                field={field}
                value={fieldValue}
                label={field.name}
                resource={resource}
                key={field.inputName}
            />
        )
    }

    getNonRelationalFields() {
        return this.state.resource.fields.filter(
            (field) => !field.isRelationshipField && field.showOnDetail
        )
    }

    getRelationalFields() {
        return this.state.resource.fields.filter(
            (field) => field.isRelationshipField
        )
    }

    getBelongsToManyFields() {}

    renderRelationalFields() {
        return this.getRelationalFields().map((field) => {
            const Component = Flamingo.detailFieldComponents[field.component]

            if (!Component) {
                return null
            }

            return (
                <div className="mt-10">
                    <Component
                        field={field}
                        resourceId={this.props.match.params.resourceId}
                        resource={this.state.resource}
                    />
                </div>
            )
        })
    }

    render() {
        const { resource } = this.state
        const {
            match: {
                params: { resourceId },
            },
        } = this.props

        const fields = this.getNonRelationalFields()

        return (
            <Fragment>
                <div className="flex justify-between mb-5">
                    <Heading>{resource.name} details</Heading>

                    <div>
                        <ActionsDropdown
                            position="detail"
                            resource={resource}
                            selected={[resourceId]}
                        />
                        <Link
                            className="ml-2"
                            to={Flamingo.getPath(
                                `resources/${resource.slug}/${resourceId}/edit`
                            )}
                        >
                            <Button buttonType="primary">Edit</Button>
                        </Link>
                        <Button buttonType="negative" className="ml-2">
                            Delete
                        </Button>
                    </div>
                </div>

                <Card>
                    {fields.map((field, index) => (
                        <div
                            key={field.inputName}
                            className={cn(
                                'w-full flex items-center flex-wrap',
                                {
                                    'border-t border-gray-lightest-100':
                                        index !== 0,
                                    'py-3':
                                        index !== 0 &&
                                        index !== fields.length - 1,
                                    'pb-3': index === 0,
                                    'pt-3': index === fields.length - 1,
                                }
                            )}
                        >
                            <div className="w-1/4">
                                <Paragraph>{field.name}</Paragraph>
                            </div>
                            <div className="w-3/4">
                                {this.renderResourceField(field)}
                            </div>
                        </div>
                    ))}
                </Card>

                {this.renderRelationalFields()}
            </Fragment>
        )
    }
}

export default withResources(ShowResource)
