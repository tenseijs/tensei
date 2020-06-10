import React, { Fragment } from 'react'
import { withResources } from 'store/resources'
import { Link, Redirect } from 'react-router-dom'
import IndexSettings from 'components/IndexSettings'
import { Text } from 'office-ui-fabric-react/lib/Text'
import {
    PrimaryButton,
    DefaultButton,
    ActionButton,
} from 'office-ui-fabric-react/lib/Button'
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList'
import {
    DetailsList,
    DetailsListLayoutMode,
    Selection,
    SelectionMode,
    IColumn,
  } from 'office-ui-fabric-react/lib/DetailsList'
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox'

class ResourceIndex extends React.Component {
    state = {
        resource: this.findResource(),
        showingSettings: false,
        loading: true
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                loading: false
            })
        }, 3000)
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

    getTableColumns () {
        return [
            {
                key: 'email',
                fieldName: 'email',
                name: 'Email'
            },
            {
                key: 'name',
                fieldName: 'name',
                name: 'Name',
            },
            
            {
                key: 'date_joined',
                fieldName: 'date_joined',
                name: 'Date joined'
            },

            {
                key: 'date_ended',
                fieldName: 'date_ended',
                name: 'Date ended'
            },
        ]
    }

    render() {
        const { resource, loading } = this.state

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

                    <Link to={`/resources/${resource.param}/new`}>
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
                    </Link>
                </header>

                <div className="w-full mt-8 flex flex-wrap items-center justify-between">
                    <SearchBox className='w-full md:w-1/4' placeholder={`Search ${resource.label.toLowerCase()}`}>

                    </SearchBox>
                    <div className='w-full md:w-3/4 mt-4 md:mt-0 flex items-center justify-between md:justify-end'>
                        <DefaultButton
                            iconProps={{
                                iconName: 'Filter',
                                
                            }}
                        >
                            Filters
                        </DefaultButton>

                        <ActionButton
                            className='ml-2'
                            iconProps={{
                                iconName: 'Settings',
                            }}
                        >
                            Settings
                        </ActionButton>
                    </div>
                </div>
            
                <div className="mt-8 w-full">
                    <ShimmeredDetailsList
                        items={[{
                            name: 'Bahdcoder Kati',
                            email: 'bahdcoder@gmail.com',
                            date_joined: '2020-02-1939',
                            date_ended: '2020-05-03'
                        }]}
                        enableShimmer={loading}
                        columns={this.getTableColumns()}
                        layoutMode={DetailsListLayoutMode.justified}
                        isHeaderVisible={true}
                        // onItemInvoked={this._onItemInvoked}
                        ariaLabelForSelectionColumn={`Toggle selection for this ${resource.name.toLowerCase()}`}
                        ariaLabelForSelectAllCheckbox={`Toggle selection for all ${resource.label.toLowerCase()}`}
                    />
                </div>
            </Fragment>
        )
    }
}

export default withResources(ResourceIndex)
