import React from 'react'
import { withResources } from 'store/resources'
import { Text } from 'office-ui-fabric-react/lib/Text'
import {
    DefaultButton,
    PrimaryButton,
    IconButton,
} from 'office-ui-fabric-react/lib/Button'

class CreateResource extends React.Component {
    state = this.defaultState()

    defaultState() {
        return {
            form: {},
            submitting: false,
            formInitialized: false,
            resource: this.findResource(),
            editingState: !!this.props.match.params.resourceId,
            errors: {},
        }
    }

    findResource() {
        return this.props.resources.find(
            (resource) => resource.param === this.props.match.params.resource
        )
    }

    componentDidMount() {
        this.initializeForm()
    }

    initializeForm = () => {
        const [form, errors] = this.getDefaultFormState()
        this.setState({
            formInitialized: true,
            form,
            errors,
        })
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

    getDefaultFormState = () =>
        this.state.editingState
            ? this.getDefaultEditingFormState()
            : this.getDefaultCreationFormState()

    getDefaultEditingFormState = () => {}

    resetForm = () =>
        this.setState({
            form: this.getDefaultFormState(),
        })

    getDefaultCreationFormState = () => {
        const form = {}
        const errors = {}

        this.getResourceFields().forEach((field) => {
            form[field.inputName] = field.defaultValue
            errors[field.inputName] = null
        })

        this.getResourceObjectFields().forEach((objectField) => {
            form[objectField.inputName] = form[objectField.inputName] || {}
            errors[objectField.inputName] = {}

            objectField.fields.forEach((childField) => {
                form[objectField.inputName][childField.inputName] =
                    childField.defaultValue

                errors[objectField.inputName][childField.inputName] = null
            })
        })

        this.getResourceObjectArrayFields().forEach((field) => {
            form[field.inputName] = form[field.inputName] || []
            errors[field.inputName] = []

            field.fields.forEach((childField) => {
                form[field.inputName][0] = form[field.inputName][0] || {}
                form[field.inputName][0][childField.inputName] =
                    childField.defaultValue

                errors[field.inputName][0] = errors[field.inputName][0] || {}

                errors[field.inputName][0][childField.inputName] = null
            })
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

        const { errors, form } = this.state

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
                    field={resourceField}
                    label={resourceField.name}
                    errorMessage={errorMessage}
                    onFieldChange={onFieldChange}
                />
            </div>
        )
    }

    submit = () => {
        this.setState({
            submitting: true,
        })

        Flamingo.request
            .post(`resources/${this.state.resource.param}`, this.state.form)
            .then(() => {})
            .catch((error) => {
                this.setState({
                    errors: error.response.data,
                })
            })
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
                <div className="w-full md:w-1/4 flex flex-col mb-5 md:mb-0">
                    <Text variant="large">{field.name}</Text>
                    <Text variant="medium" className="opacity-75">
                        {field.description || `Provide the ${field.inputName}`}
                    </Text>
                </div>

                <div className="w-full md:w-2/4 bg-white shadow px-6 py-6">
                    {field.fields.map((childField) =>
                        this.renderResourceField(childField, field)
                    )}
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
        const { resource, formInitialized, form } = this.state

        return (
            <React.Fragment>
                <header className="flex flex-wrap items-center justify-between">
                    <Text variant="xLarge">
                        Create {resource.name.toLowerCase()}
                    </Text>

                    <div className="w-full md:w-auto mt-4 md:mt-0">
                        <DefaultButton
                            onClick={this.resetForm}
                            className="mr-3"
                        >
                            Reset
                        </DefaultButton>

                        <PrimaryButton onClick={this.submit}>
                            <Text>Create {resource.name}</Text>
                        </PrimaryButton>
                    </div>
                </header>

                {formInitialized && (
                    <React.Fragment>
                        {this.getResourceFields().length > 0 ? (
                            <div className="w-full flex flex-wrap mt-10">
                                <div className="w-full md:w-1/4 flex flex-col mb-5 md:mb-0">
                                    <Text variant="large">{resource.name}</Text>
                                    <Text
                                        variant="medium"
                                        className="opacity-75"
                                    >
                                        Put in information about the new{' '}
                                        {resource.name.toLowerCase()}
                                    </Text>
                                </div>

                                <div className="w-full md:w-2/4 bg-white shadow px-6 py-6">
                                    {this.getResourceFields().map((field) =>
                                        this.renderResourceField(field)
                                    )}
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
                                    <div className="w-full md:w-1/4 flex flex-col mb-5 md:mb-0">
                                        <Text variant="large">
                                            {field.name}
                                        </Text>
                                        <Text
                                            variant="medium"
                                            className="opacity-75"
                                        >
                                            {field.description ||
                                                `Provide the ${field.inputName}`}
                                        </Text>
                                    </div>

                                    <div className="w-full md:w-2/4">
                                        {form[field.inputName].map(
                                            (formField, formIndex) => (
                                                <div
                                                    className="mb-5"
                                                    key={`${field.inputName}-${formIndex}`}
                                                >
                                                    <div className="w-full flex justify-between mb-2 items-center">
                                                        <h3 className="mb-3">
                                                            {field.singleName}{' '}
                                                            {formIndex + 1}
                                                        </h3>

                                                        <IconButton
                                                            onClick={() =>
                                                                this.removeObjectArrayItem(
                                                                    field,
                                                                    formIndex
                                                                )
                                                            }
                                                            iconProps={{
                                                                iconName:
                                                                    'ChromeClose',
                                                            }}
                                                        >
                                                            Remove
                                                        </IconButton>
                                                    </div>
                                                    <div className="bg-white shadow p-6">
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
                                                </div>
                                            )
                                        )}
                                        <div className="w-full flex justify-end mt-3">
                                            <PrimaryButton
                                                className="mr-2"
                                                onClick={() =>
                                                    this.addObjectArrayItem(
                                                        field
                                                    )
                                                }
                                            >
                                                Add new{' '}
                                                {field.singleName.toLowerCase()}
                                            </PrimaryButton>
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
