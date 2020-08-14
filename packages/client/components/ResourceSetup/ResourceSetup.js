import React, { Fragment } from 'react'
import cn from 'classnames'
import Paginator from 'react-paginate'
import { Link } from 'react-router-dom'

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

class ResourceSetup extends React.Component {
    state = {
        title: this.props.title,
        resource: this.props.resource,
        showingFilters: false,
        data: this.props.data,
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
        page: this.props.page,
        perPage: this.props.resource.perPageOptions[0] || 10,
        total: this.props.total,
        pageCount: this.props.pageCount,
        selected: [],
        deleting: null,
        deleteLoading: false,
        search: '',
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

        const tableColumns = this.props.getTableColumns()

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
                            this.props.onSearchChange(event.target.value)
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
                                addFilter={this.props.addFilter}
                                removeFilter={this.props.removeFilter}
                                fields={this.props.tableColumns}
                            />
                        </Dropdown>
                        <Link
                            className="ml-3"
                            to={Flamingo.getPath(
                                `resources/${this.props.resource.slug}/new`
                            )}
                        >
                            <Button>
                                Add {this.props.resource.name.toLowerCase()}
                            </Button>
                        </Link>
                    </div>
                </div>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Checkbox
                                    checked={selectAllChecked}
                                    onChange={this.props.handleSelectAllClicked}
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
                        {this.props.loading ? (
                            <SkeletonRow rowCount={10} />
                        ) : (
                            <>
                                {this.props.getTableData().map((row) => (
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
                                                    this.props.handleCheckboxChange(
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
                                                        this.props.setParentState(
                                                            {
                                                                deleting: row,
                                                            }
                                                        )
                                                    }
                                                    className="cursor-pointer"
                                                    iconProps={{
                                                        icon: 'Edit',
                                                        color: 'negative',
                                                    }}
                                                    label=""
                                                />
                                            </Link>
                                            <IconButton
                                                onClick={() =>
                                                    this.props.setParentState({
                                                        deleting: row,
                                                    })
                                                }
                                                className="cursor-pointer"
                                                iconProps={{
                                                    icon: 'Delete',
                                                    color: 'negative',
                                                }}
                                                label=""
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
                                    this.props.setParentState(
                                        {
                                            perPage: event.target.value,
                                            loading: true,
                                        },
                                        () => this.props.fetch()
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
                            pageCount={10}
                            onPageChange={({ selected }) =>
                                this.props.setParentState(
                                    {
                                        page: selected + 1,
                                        loading: true,
                                    },
                                    () => this.props.fetch()
                                )
                            }
                            previousLinkClassName="flex items-center page-link outline-none"
                            previousClassName="page-item px-4 border-t border-b border-l h-full flex items-center transition duration-150 ease-in-out hover:bg-gray-lightest-200"
                            previousLabel={'Previous'}
                            nextLabel={'Next'}
                            pageClassName="cursor-pointer page-item border-gray-lightest-200 border-l border-t border-b border-r-0 px-4 h-full w-10 flex justify-center bg-white transition duration-150 ease-in-out hover:bg-gray-lightest-200"
                            pageLinkClassName="flex items-center page-link outline-none cursor-default"
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
                    onCancel={() =>
                        this.props.setParentState({
                            deleting: null,
                        })
                    }
                    isConfirmLoading={deleteLoading}
                    onConfirm={this.props.deleteResource}
                >
                    <Paragraph>
                        Are you sure you want to delete this resource ?
                    </Paragraph>
                </ModalConfirm>
            </Fragment>
        )
    }
}

export default ResourceSetup
