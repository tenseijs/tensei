import React from 'react'

import { withResources } from '~/store/resources'
import { debounce } from 'throttle-debounce'
import ResourceSetup from '~/components/ResourceSetup/ResourceSetup'

class ResourceIndex extends React.Component {
    state = this.defaultState()

    defaultState() {
        const resource = this.findResource()
        return {
            resource,
            showingSettings: false,
            loading: true,
            data: [],
            filters: [],
            showingFilters: false,
            filters: [
                {
                    field: '',
                    operator: '',
                    value: '',
                },
            ],
            operators: [
                {
                    label: 'Is equal to',
                    value: 'eq',
                },
                {
                    label: 'Is not equal to',
                    value: 'ne',
                },
                {
                    label: 'Is greater than',
                    value: 'gt',
                },
                {
                    label: 'Is less than',
                    value: 'lt',
                },
                {
                    label: 'Is greater than or equal to',
                    value: 'gte',
                },
                {
                    label: 'Is less than or equal to',
                    value: 'lte',
                },
            ],
            page: 1,
            perPage: resource.perPageOptions[0] || 10,
            total: 0,
            pageCount: 1,
            selected: [],
            deleting: null,
            deleteLoading: false,
            search: '',
        }
    }

    componentDidMount() {
        this.fetch()

        this.pushParamsToUrl()
    }

    pushParamsToUrl = () => {
        this.props.history.push(
            `${this.props.location.pathname}?page=${this.state.page}&perPage=${this.state.perPage}&search=${this.state.search}`
        )
    }

    addFilter = () => {
        this.setState({
            filters: [
                ...this.state.filters,
                {
                    field: '',
                    value: '',
                    operator: '',
                },
            ],
        })
    }

    fetch = () => {
        const { resource, perPage, page, search } = this.state

        this.pushParamsToUrl()

        Flamingo.request
            .get(
                `resources/${
                    resource.slug
                }?perPage=${perPage}&page=${page}&search=${search || ''}`
            )
            .then(({ data }) => {
                this.setState({
                    data: data.data,
                    loading: false,
                    page: data.page,
                    total: data.total,
                    perPage: data.perPage,
                    pageCount: data.pageCount,
                })
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                })

                Flamingo.library.Notification.error(
                    `There might be a problem with your query parameters.`
                )
            })
    }

    componentDidUpdate(prevProps) {
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
            (resource) => resource.slug === this.props.match.params.resource
        )
    }

    getShowOnIndexColumns = () =>
        this.state.resource.fields.filter((field) => field.showOnIndex)

    getTableColumns = () => this.getShowOnIndexColumns()

    handleCheckboxChange = (event, row) => {
        const primaryKey = row.key

        this.setState({
            selected: this.state.selected.includes(primaryKey)
                ? this.state.selected.filter((key) => key !== primaryKey)
                : [...this.state.selected, primaryKey],
        })
    }

    handlePaginatorChange = ({ selected }) => {
        return this.setState(
            {
                page: selected + 1,
                loading: true,
            },
            () => this.fetch()
        )
    }

    getTableData = () => {
        return this.state.data.map((row) => ({
            key: row.id,
            cells: [
                ...this.getTableColumns().map((column) => {
                    const Component =
                        Flamingo.indexFieldComponents[column.component]

                    return {
                        content: Component ? (
                            <Component
                                value={row[column.inputName]}
                                field={column}
                            />
                        ) : (
                            row[column.inputName]
                        ),
                    }
                }),
            ],
        }))
    }

    showFilter = () => {
        this.setState({
            showFilter: !this.state.showFilter,
        })
    }

    handleSelectAllClicked = (event) => {
        this.setState({
            selected: event.target.checked
                ? this.state.data.map(
                      (row) => row[this.state.resource.primaryKey]
                  )
                : [],
        })
    }

    onSearchChange = debounce(500, (search) => {
        this.setState(
            {
                isLoading: true,
                search,
            },
            () => this.fetch()
        )
    })

    deleteResource = () => {
        this.setState({
            deleteLoading: true,
        })

        const { resource, deleting } = this.state

        const resourceId = deleting.key

        Flamingo.request
            .delete(`resources/${resource.slug}/${resourceId}`)
            .then(() => {
                this.setState(
                    {
                        deleteLoading: false,
                        deleting: null,
                        loading: true,
                    },
                    () => this.fetch()
                )

                Flamingo.library.Notification.success(
                    `Resource has been deleted.`
                )
            })
            .catch(() => {
                this.setState({
                    deleteLoading: false,
                    deleting: null,
                })

                Flamingo.library.Notification.error(
                    `Could not delete resource with ID ${resourceId}.`
                )
            })
    }

    render() {
        return (
            <ResourceSetup
                {...this.state}
                history={this.props.history}
                deleteResource={this.deleteResource}
                onSearchChange={this.onSearchChange}
                handleSelectAllClicked={this.handleSelectAllClicked}
                handleCheckboxChange={this.handleCheckboxChange}
                fetch={this.fetch}
                addFilter={this.addFilter}
                getTableData={this.getTableData}
                getTableColumns={this.getTableColumns}
                setParentState={this.setState.bind(this)}
            />
        )
    }
}

export default withResources(ResourceIndex)
