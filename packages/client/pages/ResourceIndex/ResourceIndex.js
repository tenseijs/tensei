import cn from 'classnames'
import Paginator from 'react-paginate'
import { Link } from 'react-router-dom'
import React, { Fragment } from 'react'

import { withResources } from '~/store/resources'
import ArrowIcon from '~/components/ArrowIcon'
import Filters from '~/components/Filters'
import {
    ModalConfirm,
    Option,
    IconButton,
    Heading,
    Table,
    Select,
    TextInput,
    Button,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    SkeletonRow,
    Checkbox,
    Paragraph,
    Dropdown,
} from '@contentful/forma-36-react-components'
import { debounce } from 'throttle-debounce'

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
        const primaryKey = row[this.state.resource.primaryKey]

        this.setState({
            selected: this.state.selected.includes(primaryKey)
                ? this.state.selected.filter((key) => key !== primaryKey)
                : [...this.state.selected, primaryKey],
        })
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
        const {
            resource,
            loading,
            data,
            filters,
            operators,
            deleting,
            page,
            perPage,
            total,
            pageCount,
            selected,
            search,
            showingFilters,
            deleteLoading,
        } = this.state

        const selectAllChecked =
            selected.length === data.length && data.length > 0

        const tableColumns = this.getTableColumns()

        const showingFrom = perPage * (page - 1)
        const showingOnPage = parseInt(showingFrom + perPage)

        return (
            <Fragment>
                <Heading>{resource.label}</Heading>
                <div className="flex justify-between my-5">
                    <TextInput
                        width="large"
                        value={search}
                        onChange={(event) =>
                            this.onSearchChange(event.target.value)
                        }
                        placeholder={`Type to search for ${resource.label.toLowerCase()}`}
                    />

                    <div>
                        <Dropdown
                            isOpen={showingFilters}
                            onClose={() =>
                                this.setState({
                                    showingFilters: !showingFilters,
                                })
                            }
                            toggleElement={
                                <Button
                                    buttonType="muted"
                                    icon="Filter"
                                    onClick={() =>
                                        this.setState({
                                            showingFilters: !showingFilters,
                                        })
                                    }
                                >
                                    Filters
                                </Button>
                            }
                        >
                            <Filters
                                filters={filters}
                                operators={operators}
                                addFilter={this.addFilter}
                                removeFilter={this.removeFilter}
                                fields={tableColumns}
                            />
                        </Dropdown>
                        <Link
                            className="ml-3"
                            to={Flamingo.getPath(
                                `resources/${resource.slug}/new`
                            )}
                        >
                            <Button>Add {resource.name.toLowerCase()}</Button>
                        </Link>
                    </div>
                </div>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Checkbox
                                    checked={selectAllChecked}
                                    onChange={this.handleSelectAllClicked}
                                />
                            </TableCell>
                            {tableColumns.map((column) => (
                                <TableCell key={column.inputName}>
                                    {column.name}
                                </TableCell>
                            ))}
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <SkeletonRow rowCount={10} />
                        ) : (
                            <>
                                {this.getTableData().map((row) => (
                                    <TableRow
                                        className={cn('cursor-pointer', {
                                            'bg-blue-lightest': selected.includes(
                                                row.key
                                            ),
                                        })}
                                        key={row.key}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selected.includes(
                                                    row.key
                                                )}
                                                onChange={() => {
                                                    const primaryKey = row.key

                                                    this.setState({
                                                        selected: selected.includes(
                                                            primaryKey
                                                        )
                                                            ? selected.filter(
                                                                  (key) =>
                                                                      key !==
                                                                      primaryKey
                                                              )
                                                            : [
                                                                  ...selected,
                                                                  primaryKey,
                                                              ],
                                                    })
                                                }}
                                            />
                                        </TableCell>
                                        {row.cells.map((cell, index) => (
                                            <TableCell
                                                onClick={() => {
                                                    this.props.history.push(
                                                        Flamingo.getPath(
                                                            `resources/${resource.slug}/${row.key}`
                                                        )
                                                    )
                                                }}
                                                key={`${row.key}-cell-${index}`}
                                            >
                                                <Link
                                                    to={Flamingo.getPath(
                                                        `resources/${resource.slug}/${row.key}`
                                                    )}
                                                >
                                                    {cell.content}
                                                </Link>
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <Link
                                                to={Flamingo.getPath(
                                                    `resources/${resource.slug}/${row.key}/edit`
                                                )}
                                                className="cursor-pointer"
                                                style={{ marginRight: '10px' }}
                                            >
                                                <IconButton
                                                    onClick={() =>
                                                        this.setState({
                                                            deleting: row,
                                                        })
                                                    }
                                                    className="cursor-pointer"
                                                    iconProps={{
                                                        icon: 'Edit',
                                                        color: 'negative',
                                                    }}
                                                />
                                            </Link>
                                            <IconButton
                                                onClick={() =>
                                                    this.setState({
                                                        deleting: row,
                                                    })
                                                }
                                                className="cursor-pointer"
                                                iconProps={{
                                                    icon: 'Delete',
                                                    color: 'negative',
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </>
                        )}
                    </TableBody>
                </Table>
                <div className="flex mt-5 flex-wrap flex-col md:flex-row items-center justify-between">
                    <>
                        <div className="flex items-center">
                            <Select
                                name="per-page"
                                id="per-page"
                                defaultValue={perPage}
                                onChange={(event) =>
                                    this.setState(
                                        {
                                            perPage: event.target.value,
                                            loading: true,
                                        },
                                        () => this.fetch()
                                    )
                                }
                            >
                                {resource.perPageOptions.map(
                                    (perPageOption) => (
                                        <Option
                                            key={perPageOption}
                                            value={perPageOption.toString()}
                                        >
                                            {perPageOption} / page
                                        </Option>
                                    )
                                )}
                            </Select>
                        </div>

                        <Paragraph>
                            Showing <span>{showingFrom}</span> to{' '}
                            <span>
                                {showingOnPage > total ? total : showingOnPage}
                            </span>{' '}
                            of <span>{total}</span> entries
                        </Paragraph>

                        <Paginator
                            forcePage={page - 1}
                            pageCount={pageCount}
                            onPageChange={({ selected }) =>
                                this.setState(
                                    {
                                        page: selected + 1,
                                        loading: true,
                                    },
                                    () => this.fetch()
                                )
                            }
                            previousLinkClassName="flex items-center page-link"
                            previousClassName="page-item"
                            previousLabel={
                                <Paragraph style={{ display: 'flex' }}>
                                    <ArrowIcon className="mt-1 transform rotate-90" />
                                    Prev
                                </Paragraph>
                            }
                            nextLabel={
                                <Paragraph style={{ display: 'flex' }}>
                                    Next{' '}
                                    <ArrowIcon className="mt-1 transform -rotate-90" />
                                </Paragraph>
                            }
                            pageClassName="page-item"
                            pageLinkClassName="flex items-center page-link"
                            nextLinkClassName="flex items-center page-link"
                            nextClassName="page-item"
                            breakLabel="..."
                            containerClassName="pagination flex items-center justify-center"
                            activeClassName="active"
                        />
                    </>
                </div>

                <ModalConfirm
                    intent="negative"
                    isShown={!!deleting}
                    title="Delete resource"
                    confirmLabel="Delete"
                    onCancel={() =>
                        this.setState({
                            deleting: null,
                        })
                    }
                    isConfirmLoading={deleteLoading}
                    onConfirm={this.deleteResource}
                >
                    <Paragraph>
                        Are you sure you want to delete this resource ?
                    </Paragraph>
                </ModalConfirm>
            </Fragment>
        )
    }
}

export default withResources(ResourceIndex)
