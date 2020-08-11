import React from 'react'
import { withResources } from '~/store/resources'

import {
    Button,
    Heading,
    Subheading,
    Paragraph,
} from '@contentful/forma-36-react-components'

class CreateResource extends React.Component {
    state = this.defaultState()

    defaultState() {
        return {
            form: {},
            model: {},
            submitting: false,
            formInitialized: false,
            resource: this.findResource(),
            editingState: !!this.props.match.params.resourceId,
            errors: {},
        }
    }

    findResource() {
        return this.props.resources.find(
            (resource) => resource.slug === this.props.match.params.resource
        )
    }

    componentDidMount() {
        this.initializeForm()
    }

    initializeForm = () => {
        const { editingState, resource } = this.state
        const { resourceId } = this.props.match.params

        if (editingState) {
            Flamingo.request
                .get(`resources/${resource.slug}/${resourceId}`)

                .then(({ data }) => {
                    const [form, errors] = this.getDefaultFormState(data)

                    this.setState({
                        form,
                        errors,
                        model: data,
                        formInitialized: true,
                    })
                })

                .catch(() => {
                    Flamingo.library.Notification.error(
                        `Could not find resource with ID. ${resourceId}`
                    )

                    this.props.history.push(
                        Flamingo.getPath(`resources/${resource.slug}`)
                    )
                })
        } else {
            const [form, errors] = this.getDefaultFormState()

            this.setState({
                formInitialized: true,
                form,
                errors,
            })
        }
    }

    getUpdateFields = () =>
        this.state.resource.fields.filter((field) => field.showOnUpdate)

    getCreationFields = () =>
        this.state.resource.fields.filter((field) => field.showOnCreation)

    getResourceFields = () =>
        (this.state.editingState
            ? this.getUpdateFields()
            : this.getCreationFields()
        ).filter(
            (field) =>
                !['HasOneField', 'HasManyEmbeddedField'].includes(
                    field.component
                )
        )

    getResourceObjectFields = () =>
        (this.state.editingState
            ? this.getUpdateFields()
            : this.getCreationFields()
        ).filter((field) => field.component === 'HasOneField')

    getResourceObjectArrayFields = () =>
        (this.state.editingState
            ? this.getUpdateFields()
            : this.getCreationFields()
        ).filter((field) => field.component === 'HasManyEmbeddedField')

    resetForm = () => {
        const [form, errors] = this.getDefaultFormState(this.state.model)
        this.setState({
            form,
            errors,
        })
    }

    getDefaultFormState = (model = {}) => {
        const form = {}
        const errors = {}

        this.getResourceFields().forEach((field) => {
            form[field.inputName] = model[field.inputName] || field.defaultValue
            errors[field.inputName] = null

            if (field.component === 'HasManyField') {
                // TODO: Work on this during updates. Should be different.
                form[field.inputName] = model[field.inputName] || []
                errors[field.inputName] = null
            }
        })

        this.getResourceObjectFields().forEach((objectField) => {
            form[objectField.inputName] =
                model[objectField.inputName] ||
                form[objectField.inputName] ||
                {}
            errors[objectField.inputName] = {}

            if (model[objectField.inputName]) {
                form[objectField.inputName] = model[objectField.inputName]
            } else {
                objectField.fields.forEach((childField) => {
                    form[objectField.inputName][childField.inputName] =
                        [childField.inputName] || childField.defaultValue

                    errors[objectField.inputName][childField.inputName] = null
                })
            }
        })

        this.getResourceObjectArrayFields().forEach((field) => {
            form[field.inputName] =
                model[field.inputName] || form[field.inputName] || []
            errors[field.inputName] = []

            if (model[field.inputName]) {
                form[field.inputName] = model[field.inputName]
            } else {
                field.fields.forEach((childField) => {
                    form[field.inputName][0] = form[field.inputName][0] || {}
                    form[field.inputName][0][childField.inputName] =
                        childField.defaultValue

                    errors[field.inputName][0] =
                        errors[field.inputName][0] || {}

                    errors[field.inputName][0][childField.inputName] = null
                })
            }
        })

        return [form, errors]
    }

    getObjectArrayFieldDefaultItem = (field) => {
        const form = {}

        field.fields.forEach((childField) => {
            form[childField.inputName] = form[field.inputName] || {}
            form[childField.inputName] = childField.defaultValue
        })

        return form
    }

    renderResourceField = (
        resourceField,
        parentResourceField = null,
        [arrayParentResourceField, resourceFieldIndex] = []
    ) => {
        const Component = Flamingo.fieldComponents[resourceField.component]

        if (!Component) {
            return null
        }

        const { errors, form, resource, editingState } = this.state

        let fieldValue = ''
        let errorMessage = null

        if (parentResourceField) {
            errorMessage = (errors[parentResourceField.inputName] || {})[
                resourceField.inputName
            ]
        }

        if (!parentResourceField) {
            errorMessage = errors[resourceField.inputName]
        }

        if (arrayParentResourceField) {
            errorMessage = ((errors[arrayParentResourceField.inputName] || [])[
                resourceFieldIndex
            ] || {})[resourceField.inputName]
        }

        if (parentResourceField) {
            fieldValue =
                form[parentResourceField.inputName][resourceField.inputName]
        }

        if (!parentResourceField) {
            fieldValue = form[resourceField.inputName]
        }

        if (arrayParentResourceField) {
            fieldValue =
                form[arrayParentResourceField.inputName][resourceFieldIndex][
                    resourceField.inputName
                ]
        }

        let onFieldChange = console.log

        if (parentResourceField) {
            onFieldChange = (value) =>
                this.handleObjectFieldChange(
                    parentResourceField,
                    resourceField,
                    value
                )
        }

        if (!parentResourceField) {
            onFieldChange = (value) =>
                this.handleFieldChange(resourceField.inputName, value)
        }

        if (arrayParentResourceField) {
            onFieldChange = (value) =>
                this.handleArrayObjectField(
                    parentResourceField,
                    resourceField,
                    resourceFieldIndex,
                    value
                )
        }

        return (
            <div key={resourceField.inputName} className="mb-3">
                <Component
                    value={fieldValue}
                    resource={resource}
                    field={resourceField}
                    label={resourceField.name}
                    editingState={editingState}
                    errorMessage={errorMessage}
                    onFieldChange={onFieldChange}
                    resourceId={this.props.match.params.resourceId}
                />
            </div>
        )
    }

    submit = () => {
        this.setState({
            submitting: true,
        })

        const { resource, editingState } = this.state

        Flamingo.request[editingState ? 'put' : 'post'](
            `resources/${resource.slug}/${
                editingState ? this.props.match.params.resourceId : ''
            }`,
            {
                ...this.state.form,
                somethingNotSupposedToBeHere: 'somethingNotSupposedToBeHere',
            }
        )
            .then(() => {
                this.props.history.push(
                    Flamingo.getPath(`resources/${resource.slug}`)
                )

                Flamingo.library.Notification.success(
                    `Resource has been ${editingState ? 'updated' : 'created'}.`
                )
            })
            .catch((error) => {
                Flamingo.library.Notification.error(
                    `Failed ${editingState ? 'updating' : 'creating'} resource.`
                )

                this.setState({
                    errors: this.formatErrors(error?.response?.data?.errors),
                })
            })
    }

    formatErrors = (errors) => {
        let formattedErrors = {}

        errors.forEach((error) => {
            formattedErrors[error.field] = error.message
        })

        return formattedErrors
    }

    handleFieldChange = (field, value) => {
        this.setState({
            form: {
                ...this.state.form,
                [field]: value,
            },
        })
    }

    handleArrayObjectField = (parentField, field, arrayFieldIndex, value) => {
        this.setState({
            form: {
                ...this.state.form,
                [parentField.inputName]: this.state.form[
                    parentField.inputName
                ].map((formValue, stateFormFieldIndex) => {
                    if (arrayFieldIndex === stateFormFieldIndex) {
                        return {
                            ...formValue,
                            [field.inputName]: value,
                        }
                    }

                    return formValue
                }),
            },
        })
    }

    handleObjectFieldChange = (parentField, field, value) => {
        this.setState({
            form: {
                ...this.state.form,
                [parentField.inputName]: {
                    ...this.state.form[parentField.inputName],
                    [field.inputName]: value,
                },
            },
        })
    }

    renderObjectField = (field) => {
        return (
            <div key={field.inputName} className="w-full flex flex-wrap mt-10">
                <div className="w-full md:w-1/3 flex flex-col mb-5 md:mb-0">
                    <Subheading>{field.name}</Subheading>
                    <Paragraph>
                        {field.description || `Provide the ${field.inputName}`}
                    </Paragraph>
                </div>

                <div className="w-full md:w-2/3">
                    <div className="w-full md:w-5/6 bg-gray-lightest p-6 mb-3">
                        {field.fields.map((childField) =>
                            this.renderResourceField(childField, field)
                        )}
                    </div>
                </div>
            </div>
        )
    }

    removeObjectArrayItem = (field, index) => {
        this.setState({
            form: {
                ...this.state.form,
                [field.inputName]: this.state.form[field.inputName].filter(
                    (fieldItem, fieldItemIndex) => fieldItemIndex !== index
                ),
            },
            errors: {
                ...this.state.errors,
                [field.inputName]: this.state.errors[field.inputName].filter(
                    (fieldItem, fieldItemIndex) => fieldItemIndex !== index
                ),
            },
        })
    }

    addObjectArrayItem = (field) => {
        this.setState({
            form: {
                ...this.state.form,
                [field.inputName]: [
                    ...this.state.form[field.inputName],
                    this.getObjectArrayFieldDefaultItem(field),
                ],
            },
        })
    }

    render() {
        const {
            resource,
            formInitialized,
            form,
            editingState: editing,
        } = this.state

        return (
            <React.Fragment>
                <header className="flex flex-wrap items-center justify-between">
                    <Heading className="mb-0">
                        {editing ? 'Update' : 'Create'}{' '}
                        {resource.name.toLowerCase()}
                    </Heading>

                    <div className="">
                        <Button
                            buttonType="muted"
                            className="mr-3"
                            onClick={this.resetForm}
                        >
                            Reset
                        </Button>

                        <Button onClick={this.submit}>
                            {editing ? 'Update' : 'Create'}{' '}
                            {resource.name.toLowerCase()}
                        </Button>
                    </div>
                </header>

                {formInitialized && (
                    <React.Fragment>
                        {this.getResourceFields().length > 0 ? (
                            <div className="w-full flex flex-wrap mt-10">
                                <div className="w-full md:w-1/3 flex flex-col mb-5 md:mb-0">
                                    <Subheading variant="large">
                                        {resource.name}
                                    </Subheading>
                                    <Paragraph>
                                        Put in information about the new{' '}
                                        {resource.name.toLowerCase()}
                                    </Paragraph>
                                </div>

                                <div className="w-full md:w-2/3">
                                    <div className="w-full md:w-5/6 bg-gray-lightest p-6 mb-3">
                                        {this.getResourceFields().map((field) =>
                                            this.renderResourceField(field)
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {this.getResourceObjectFields().map((field) =>
                            this.renderObjectField(field)
                        )}

                        {this.getResourceObjectArrayFields().map((field) => {
                            return (
                                <div
                                    key={field.inputName}
                                    className="w-full flex flex-wrap mt-10"
                                >
                                    <div className="w-full md:w-1/3 flex flex-col mb-5 md:mb-0">
                                        <Subheading>{field.name}</Subheading>
                                        <Paragraph>
                                            {field.description ||
                                                `Provide the ${field.inputName}`}
                                        </Paragraph>
                                    </div>

                                    <div className="w-full md:w-2/3">
                                        <div className="w-full md:w-5/6">
                                            {form[field.inputName].map(
                                                (formField, formIndex) => (
                                                    <div
                                                        className="mb-5 bg-gray-lightest p-6 mb-3"
                                                        key={`${field.inputName}-${formIndex}`}
                                                    >
                                                        <div className="w-full flex mb-2 justify-between items-center">
                                                            <h3 className="text-blue-darkest font-bold">
                                                                {
                                                                    field.singleName
                                                                }{' '}
                                                                {formIndex + 1}
                                                            </h3>

                                                            <Button
                                                                buttonType="naked"
                                                                onClick={() =>
                                                                    this.removeObjectArrayItem(
                                                                        field,
                                                                        formIndex
                                                                    )
                                                                }
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                        {field.fields.map(
                                                            (
                                                                childField,
                                                                childFieldIndex
                                                            ) =>
                                                                this.renderResourceField(
                                                                    childField,
                                                                    field,
                                                                    [
                                                                        field,
                                                                        formIndex,
                                                                    ]
                                                                )
                                                        )}
                                                    </div>
                                                )
                                            )}
                                            <div className="w-full flex justify-end mt-3">
                                                <Button
                                                    size="small"
                                                    onClick={() =>
                                                        this.addObjectArrayItem(
                                                            field
                                                        )
                                                    }
                                                >
                                                    Add new{' '}
                                                    {field.singleName.toLowerCase()}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </React.Fragment>
                )}
            </React.Fragment>
        )
    }
}

export default withResources(CreateResource)
