import React, { Fragment } from 'react'
import { Card, Button, Text, Icon, Form } from 'tabler-react'
import { withResources } from 'store/resources'
import { Link, Redirect } from 'react-router-dom'
import IndexSettings from 'components/IndexSettings'
import Checkbox from 'components/Checkbox'
import {
    PrimaryButton,
    DefaultButton,
    ActionButton,
} from 'office-ui-fabric-react/lib/Button'
import Table from 'components/Table'
import Filter from 'components/Filter'

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
                {/* {showFilter ? (
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
                </div> */}

                <Card title={
                        <div>
                            Invoices
                        </div>
                    }>
                        <Table
                            responsive
                            className="card-table table-vcenter text-nowrap"
                            headerItems={[
                                { content: (
                                    <Checkbox />
                                ) },
                                { content: 'No.', className: 'w-1' },
                                { content: 'Invoice Subject' },
                                { content: 'Client' },
                                { content: 'VAT No.' },
                                { content: 'Created' },
                                { content: 'Status' },
                                { content: 'Price' },
                                { content: null },
                                { content: null },
                            ]}
                            bodyItems={[
                                {
                                    key: '1',
                                    item: [
                                        {
                            content: (
                                                <Checkbox />
                                            )
                                        },
                                        {
                                            content: (
                                                <Text
                                                    RootComponent="span"
                                                    muted
                                                >
                                                    001401
                                                </Text>
                                            ),
                                        },
                                        {
                                            content: (
                                                <a
                                                    href="invoice.html"
                                                    className="text-inherit"
                                                >
                                                    Design Works
                                                </a>
                                            ),
                                        },
                                        { content: 'Carlson Limited' },
                                        { content: '87956621' },
                                        { content: '15 Dec 2017' },
                                        {
                                            content: (
                                                <React.Fragment>
                                                    <span className="status-icon bg-success" />{' '}
                                                    Paid
                                                </React.Fragment>
                                            ),
                                        },
                                        { content: '$887' },
                                        {
                                            alignContent: 'right',
                                            content: (
                                                <React.Fragment>
                                                    <Button
                                                        size="sm"
                                                        color='white'
                                                    >
                                                        Manage
                                                    </Button>
                                                </React.Fragment>
                                            ),
                                        },
                                        { content: <Icon link name="edit" /> },
                                    ],
                                },
                            ]}
                        />
                    </Card>
            </Fragment>
        )
    }
}

export default withResources(ResourceIndex)
