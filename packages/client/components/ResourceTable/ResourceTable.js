import React, { Fragment } from 'react'
import cn from 'classnames'
import Paginator from 'react-paginate'
import { Link, withRouter } from 'react-router-dom'
import { debounce } from 'throttle-debounce'

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
} from '@contentful/forma-36-react-components'

import { withAuth } from '~/store/auth'
import ActionsDropdown from '~/components/ActionsDropdown'

class ResourceTable extends React.Component {
    state = this.defaultState()

    defaultState() {
        return {
            data: [],
            page: 1,
            total: 0,
            search: '',
            pageCount: 1,
            selected: [],
            loading: true,
            deleting: null,
            deleteLoading: false,
            perPage: this.props.resource.perPageOptions[0] || 10,
        }
    }

    getShowOnIndexColumns = () =>
        this.props.resource.fields.filter((field) => field.showOnIndex)

    getTableColumns = () => this.getShowOnIndexColumns()

    handleCheckboxChange = (event, row) => {
        const primaryKey = row.key

        this.setState({
            selected: this.state.selected.includes(primaryKey)
                ? this.state.selected.filter((key) => key !== primaryKey)
                : [...this.state.selected, primaryKey],
        })
    }

    handleDeleteRow = (row) => {
        this.setState({
            deleting: row,
        })
    }

    handlePaginatorChange = ({ selected }) =>
        this.setState(
            {
                page: selected + 1,
                loading: true,
            },
            () => this.fetch()
        )

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
                                field={column}
                                value={row[column.inputName]}
                            />
                        ) : (
                            row[column.inputName]
                        ),
                    }
                }),
            ],
        }))
    }

    componentDidMount() {
        this.fetch()
    }

    componentDidUpdate(prevProps) {
        if (this.props.resource.slug !== prevProps.resource.slug) {
            this.bootComponent()
        }
    }

    bootComponent = () => {
        this.setState(this.defaultState(), () => this.fetch())
    }

    fetch = () => {
        const { resource, getEndpoint } = this.props
        const { perPage, page, search } = this.state

        const fields = this.getShowOnIndexColumns().map(
            (field) => field.inputName
        )

        this.pushParamsToUrl()

        const endpoint = getEndpoint || `resources/${resource.slug}`

        Flamingo.request
            .get(
                `${endpoint}?per_page=${perPage}&page=${page}&search=${
                    search || ''
                }&fields=${fields}`
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

    handleModalCancel = () => {
        return this.setState({
            deleting: null,
        })
    }

    pushParamsToUrl = () => {
        this.props.history.push(
            `${this.props.location.pathname}?page=${this.state.page}&per_page=${this.state.perPage}&search=${this.state.search}`
        )
    }

    handleSelectAllClicked = (event) => {
        this.setState({
            selected: event.target.checked
                ? this.state.data.map((row) => row.id)
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

    handleSelectChange = (event) => {
        return this.setState(
            {
                perPage: event.target.value,
                loading: true,
            },
            () => this.fetch()
        )
    }

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
            selected,
            data,
            perPage,
            pageCount,
            page,
            search,
            total,
            deleting,
            deleteLoading,
            loading,
        } = this.state
        const { resource } = this.props
        const selectAllChecked =
            selected.length === data.length && data.length > 0

        const tableColumns = this.getTableColumns()

        const showingFrom = perPage * (page - 1)
        const showingOnPage = parseInt(showingFrom + perPage)

        const showActionsOnTable =
            resource.actions.filter((action) => action.showOnTableRow).length >
            0

        const authorizedToCreate = this.props.auth.authorizedToCreate(
            resource.slug
        )

        const authorizedToUpdate = this.props.auth.authorizedToUpdate(
            resource.slug
        )
        const authorizedToDelete = this.props.auth.authorizedToDelete(
            resource.slug
        )

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
                        <ActionsDropdown
                            position="index"
                            selected={selected}
                            resource={resource}
                        />
                        {authorizedToCreate ? (
                            <Link
                                className="ml-3"
                                to={Flamingo.getPath(
                                    `resources/${resource.slug}/new`
                                )}
                            >
                                <Button>
                                    Add {resource.name.toLowerCase()}
                                </Button>
                            </Link>
                        ) : null}
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
                            {authorizedToDelete || authorizedToUpdate ? (
                                <TableCell />
                            ) : null}
                            {showActionsOnTable ? <TableCell /> : null}
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
                                                onChange={(e) =>
                                                    this.handleCheckboxChange(
                                                        e,
                                                        row
                                                    )
                                                }
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
                                        {showActionsOnTable ? (
                                            <TableCell>
                                                <ActionsDropdown
                                                    resource={resource}
                                                    position="table-row"
                                                    selected={[row.key]}
                                                />
                                            </TableCell>
                                        ) : null}
                                        {authorizedToUpdate ||
                                        authorizedToDelete ? (
                                            <TableCell>
                                                {authorizedToUpdate ? (
                                                    <Link
                                                        to={Flamingo.getPath(
                                                            `resources/${resource.slug}/${row.key}/edit`
                                                        )}
                                                        className="cursor-pointer"
                                                        style={{
                                                            marginRight: '10px',
                                                        }}
                                                    >
                                                        <IconButton
                                                            onClick={() =>
                                                                this.handleDeleteRow(
                                                                    row
                                                                )
                                                            }
                                                            className="cursor-pointer"
                                                            iconProps={{
                                                                icon: 'Edit',
                                                                color:
                                                                    'negative',
                                                            }}
                                                            label={`Edit resource`}
                                                        />
                                                    </Link>
                                                ) : null}
                                                {authorizedToDelete ? (
                                                    <IconButton
                                                        onClick={() =>
                                                            this.handleDeleteRow(
                                                                row
                                                            )
                                                        }
                                                        className="cursor-pointer"
                                                        iconProps={{
                                                            icon: 'Delete',
                                                            color: 'negative',
                                                        }}
                                                        label={`Delete resource`}
                                                    />
                                                ) : null}
                                            </TableCell>
                                        ) : null}
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
                                    this.handleSelectChange(event)
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
                            onPageChange={this.handlePaginatorChange}
                            previousLinkClassName="flex items-center page-link outline-none"
                            previousClassName="page-item px-4 border-t border-b border-l h-full flex items-center transition duration-150 ease-in-out hover:bg-gray-lightest-200"
                            previousLabel={'Previous'}
                            nextLabel={'Next'}
                            pageClassName="cursor-pointer page-item border-gray-lightest-200 border-l border-t border-b items-center border-r-0 h-full w-10 flex justify-center bg-white transition duration-150 ease-in-out hover:bg-gray-lightest-200"
                            pageLinkClassName="page-link outline-none cursor-default flex items-center justify-center w-full h-full"
                            nextLinkClassName="flex items-center page-link outline-none"
                            nextClassName="page-item px-4 border h-full flex items-center transition duration-150 ease-in-out hover:bg-gray-lightest-200"
                            breakLabel="..."
                            breakClassName="page-item border-gray-lightest-200 border-l px-4 py-2"
                            containerClassName="pagination flex items-center border-gray-lightest-200 justify-center bg-white-100 rounded-sm h-10"
                            activeClassName="pagination-active bg-blue-primary text-white border-none hover:bg-red-100"
                        />
                    </>
                </div>

                <ModalConfirm
                    intent="negative"
                    isShown={!!deleting}
                    title="Delete resource"
                    confirmLabel="Delete"
                    onCancel={this.handleModalCancel}
                    isConfirmLoading={deleteLoading}
                    onConfirm={this.deleteResource}
                >
                    <Paragraph>
                        Are you sure you want to delete this{' '}
                        {resource.name.toLowerCase()}?
                    </Paragraph>
                </ModalConfirm>
            </Fragment>
        )
    }
}

export default withAuth(withRouter(ResourceTable))
