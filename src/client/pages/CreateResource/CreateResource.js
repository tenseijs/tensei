import React from 'react'
import { withResources } from 'store/resources'
import { Text } from 'office-ui-fabric-react/lib/Text'
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button'

class CreateResource extends React.Component {
    state = this.defaultState()

    defaultState() {
        return {
            form: {},
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

    getResourceFields = () =>
        this.state.editingState
            ? this.getUpdateFields()
            : this.getCreationFields()

    getDefaultFormState = () =>
        this.state.editingState
            ? this.getDefaultEditingFormState()
            : this.getDefaultCreationFormState()

    getDefaultEditingFormState = () => {}

    resetForm = () => this.setState({
        form: this.getDefaultFormState()
    })

    getDefaultCreationFormState = () => {
        const form = {}

        this.getCreationFields().forEach((field) => {
            form[field.inputName] = field.defaultValue
        })

        return form
    }

    renderResourceField = (resourceField) => {
        const Component = Flamingo.fieldComponents[resourceField.component]

        return (
            <div key={resourceField.inputName} className="mb-3">
                <Component
                    field={resourceField}
                    onChange={console.log}
                    label={resourceField.name}
                    value={this.state.form[resourceField.inputName]}
                />
            </div>
        )
    }

    render() {
        const { resource } = this.state

        return (
            <React.Fragment>
                <header className="flex flex-wrap items-center justify-between">
                    <Text variant="xLarge">Create {resource.name}</Text>

                    <div className="w-full md:w-auto mt-4 md:mt-0">
                        <DefaultButton onClick={this.resetForm} className="mr-3">Reset</DefaultButton>

                        <PrimaryButton>
                            <Text>Create {resource.name}</Text>
                        </PrimaryButton>
                    </div>
                </header>

                <div className="w-full flex flex-wrap mt-10">
                    <div className="w-full md:w-1/4 flex flex-col mb-5 md:mb-0">
                        <Text variant="large">{resource.name}</Text>
                        <Text variant="medium" className="opacity-75">
                            Put in information about the new{' '}
                            {resource.name.toLowerCase()}
                        </Text>
                    </div>

                    <div className="w-full md:w-2/4 bg-white shadow px-6 py-6">
                        {this.getResourceFields().map(this.renderResourceField)}
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default withResources(CreateResource)
