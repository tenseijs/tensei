import React from 'react'
import { withResources } from 'store/resources'
import { Text } from 'office-ui-fabric-react/lib/Text'
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button'

class CreateResource extends React.Component {
    state = this.defaultState()

    defaultState() {
        return {
            form: {},
            submitting: false,
            formInitialized: false,
            resource: this.findResource(),
            editingState: !!this.props.match.params.resourceId,
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
        this.setState({
            formInitialized: true,
            form: this.getDefaultFormState(),
        })
    }

    getUpdateFields = () =>
        this.state.resource.fields.filter((field) => field.showOnUpdate)

    getCreationFields = () =>
        this.state.resource.fields.filter((field) => field.showOnCreation)

    getResourceFields = (objectFields = false) =>
        (this.state.editingState
            ? this.getUpdateFields()
            : this.getCreationFields()
        ).filter((field) =>
            objectFields
                ? field.component === 'ObjectField'
                : field.component !== 'ObjectField'
        )

    getResourceObjectFields = () => this.getResourceFields(true)

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

        this.getResourceFields().forEach((field) => {
            form[field.inputName] = field.defaultValue
        })

        this.getResourceObjectFields().forEach((objectField) => {
            form[objectField.inputName] = form[objectField.inputName] || {}

            objectField.fields.forEach((childField) => {
                form[objectField.inputName][childField.inputName] =
                    childField.defaultValue
            })
        })

        return form
    }

    renderResourceField = (resourceField, parentResourceField = null) => {
        const Component = Flamingo.fieldComponents[resourceField.component]

        return (
            <div key={resourceField.inputName} className="mb-3">
                <Component
                    field={resourceField}
                    label={resourceField.name}
                    value={
                        parentResourceField
                            ? console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>', parentResourceField, this.state.form[parentResourceField.inputName]) || this.state.form[parentResourceField.inputName][
                                  resourceField.inputName
                              ]
                            : this.state.form[resourceField.inputName]
                    }
                    // value={''}
                    onFieldChange={(value) =>
                        parentResourceField
                            ? this.handleObjectFieldChange(
                                  parentResourceField,
                                  resourceField,
                                  value
                              )
                            : this.handleFieldChange(
                                  resourceField.inputName,
                                  value
                              )
                    }
                />
            </div>
        )
    }

    submit = () => {
        this.setState({
            submitting: true,
        })

        Flamingo.request.post(
            `resources/${this.state.resource.param}`,
            this.state.form
        )
    }

    handleFieldChange = (field, value) => {
        this.setState({
            form: {
                ...this.state.form,
                [field]: value,
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

    render() {
        const { resource, formInitialized } = this.state

        return (
            <React.Fragment>
                <header className="flex flex-wrap items-center justify-between">
                    <Text variant="xLarge">Create {resource.name}</Text>

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
                        <div className="w-full flex flex-wrap mt-10">
                    <div className="w-full md:w-1/4 flex flex-col mb-5 md:mb-0">
                        <Text variant="large">{resource.name}</Text>
                        <Text variant="medium" className="opacity-75">
                            Put in information about the new{' '}
                            {resource.name.toLowerCase()}
                        </Text>
                    </div>

                    <div className="w-full md:w-2/4 bg-white shadow px-6 py-6">
                        {this.getResourceFields().map(field => this.renderResourceField(field))}
                    </div>
                </div>

                {this.getResourceObjectFields().map((field) => (
                    <div
                        key={field.inputName}
                        className="w-full flex flex-wrap mt-10"
                    >
                        <div className="w-full md:w-1/4 flex flex-col mb-5 md:mb-0">
                            <Text variant="large">{field.name}</Text>
                            <Text variant="medium" className="opacity-75">
                                Put in information about the new object field
                            </Text>
                        </div>

                        <div className="w-full md:w-2/4 bg-white shadow px-6 py-6">
                            {field.fields.map((childField) =>
                                this.renderResourceField(childField, field)
                            )}
                        </div>
                    </div>
                ))}
                    </React.Fragment>
                )}
            </React.Fragment>
        )
    }
}

export default withResources(CreateResource)
