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
import { DetailsListLayoutMode } from 'office-ui-fabric-react/lib/DetailsList'
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox'
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList'
import Filter from '../../components/Filter'

class ResourceIndex extends React.Component {
    state = this.defaultState()

    defaultState() {
        return {
            resource: this.findResource(),
            showingSettings: false,
            loading: true,
            data: [],
            showFilter: false,
            filters: [
                {
                    property: '',
                    operator: '',
                    value: '',
                },
            ],
        }
    }

    componentDidMount() {
        this.fetch()
    }

    fetch = () => {
        Flamingo.request
            .get(`resources/${this.state.resource.param}`)
            .then((data) => {
                this.setState({
                    data: data.data,
                    loading: false,
                })
            })
            .catch(console.log)
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevProps.match.params.resource !== this.props.match.params.resource
        ) {
            this.bootComponent()
        }
    }

    bootComponent = () => {
        this.setState(this.defaultState(), () => this.componentDidMount())
    }

    findResource() {
        return this.props.resources.find(
            (resource) => resource.param === this.props.match.params.resource
        )
    }

    getShowOnIndexColumns = () =>
        this.state.resource.fields.filter((field) => field.showOnIndex)

    getTableColumns = () =>
        this.getShowOnIndexColumns().map((field) => ({
            key: field.inputName,
            fieldName: field.inputName,
            name: field.name,
            isSorted: field.isSortable,
        }))

    showFilter = () => {
        this.setState({
            showFilter: !this.state.showFilter,
        })
    }

    addNewLine = () => {}

    removeLine = () => {}

    render() {
        const { resource, loading, data, showFilter } = this.state

        return (
            <Fragment>
                {showFilter ? (
                    <Filter
                        showFilter={this.showFilter}
                        resource={resource}
                        lines={this.state.filters}
                    />
                ) : (
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
                )}

                <div className="w-full mt-12 flex flex-wrap items-center justify-between">
                    <DefaultButton
                        iconProps={{
                            iconName: 'Filter',
                        }}
                        onClick={this.showFilter}
                    >
                        {showFilter ? 'Hide Filters' : 'Filters'}
                    </DefaultButton>

                    <ActionButton
                        className="ml-2"
                        iconProps={{
                            iconName: 'Settings',
                        }}
                    >
                        Settings
                    </ActionButton>
                </div>

                <div className="mt-8 w-full">
                    <ShimmeredDetailsList
                        items={data}
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
