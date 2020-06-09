import React, { Fragment } from 'react'
import { Redirect } from 'react-router-dom'
import { withResources } from 'store/resources'
import IndexSettings from 'components/IndexSettings'
import { Text } from 'office-ui-fabric-react/lib/Text'
import {
    PrimaryButton,
    DefaultButton,
    ActionButton,
} from 'office-ui-fabric-react/lib/Button'

class ResourceIndex extends React.Component {
    state = {
        resource: this.findResource(),
        showingSettings: false
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.match.params.resource !== this.props.match.params.resource
        ) {
            this.setState({
                resource: this.findResource(),
            })
        }
    }

    findResource() {
        return this.props.resources.find(
            (resource) => resource.param === this.props.match.params.resource
        )
    }

    render() {
        const { resource } = this.state

        if (!this.state.resource) {
            return <Redirect to="/" />
        }

        return (
            <Fragment>
                <header className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <Text variant="xLarge">{resource.label}</Text>

                        <Text variant="smallPlus">0 entries found</Text>
                    </div>

                    <PrimaryButton
                        iconProps={{
                            iconName: 'Add',
                            styles: {
                                marginRight: '5px',
                            },
                        }}
                    >
                        Add new {resource.name}
                    </PrimaryButton>
                </header>

                <div className="mt-8 flex items-center justify-between">
                    <DefaultButton
                        iconProps={{
                            iconName: 'Filter',
                        }}
                    >
                        Filters
                    </DefaultButton>

                    <ActionButton
                        iconProps={{
                            iconName: 'Settings',
                        }}
                    >
                        Settings
                    </ActionButton>
                </div>
            </Fragment>
        )
    }
}

export default withResources(ResourceIndex)
