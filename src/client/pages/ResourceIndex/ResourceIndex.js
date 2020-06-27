import Table from 'components/Table'
import React, { Fragment } from 'react'
import Checkbox from 'components/Checkbox'
import { withResources } from 'store/resources'
import { Link, Redirect } from 'react-router-dom'
import Card from 'components/Card'
import Icon from 'components/Icon'
import Button from 'components/Button'
import Paginator from 'react-paginate'
import Dropdown from 'components/Dropdown'

class ResourceIndex extends React.Component {
    state = this.defaultState()

    defaultState() {
        const resource = this.findResource()
        return {
            resource,
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
            page: 1,
            perPage: resource.defaultPerPage,
            total: 0,
            pageCount: 1,
        }
    }

    componentDidMount() {
        this.fetch()

        this.pushParamsToUrl()
    }

    pushParamsToUrl = () => {
        this.props.history.push(
            `${this.props.location.pathname}?page=${this.state.page}&perPage=${this.state.perPage}`
        )
    }

    fetch = () => {
        const { resource, perPage, page } = this.state

        this.pushParamsToUrl()

        Flamingo.request
            .get(`resources/${resource.param}?perPage=${perPage}&page=${page}`)
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
            content: field.name,
            isSorted: field.isSortable,
        }))

        getTableData = () => {

            return this.state.data.map(row => ({
                key: row[this.state.resource.primaryKey],
                item: [
                    {
                        content: <Checkbox />
                    },
                    ...this.getTableColumns().map(column => ({
                        content: row[column.fieldName]
                    }))
                ]
            }))
        }

    showFilter = () => {
        this.setState({
            showFilter: !this.state.showFilter,
        })
    }

    addNewLine = () => {}

    removeLine = () => {}

    render() {
        const {
            resource,
            loading,
            data,
            showFilter,
            page,
            perPage,
            total,
            pageCount,
        } = this.state

        return (
            <Fragment>
                <Card
                    footerClasses="d-flex flex-wrap flex-column flex-md-row align-items-center justify-content-between"
                    footer={
                        <>
                            <div className="d-flex">
                                <div className="text-muted">
                                    Show
                                    <div className="mx-2 d-inline-block">
                                        <select
                                            defaultValue={perPage}
                                            className="form-select"
                                            onChange={(event) =>
                                                this.setState(
                                                    {
                                                        perPage:
                                                            event.target.value,
                                                        loading: true,
                                                    },
                                                    () => this.fetch()
                                                )
                                            }
                                        >
                                            {resource.perPageOptions.map(
                                                (perPageOption) => (
                                                    <option
                                                        key={perPageOption}
                                                        value={perPageOption}
                                                    >
                                                        {perPageOption}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    entries
                                </div>
                            </div>

                            <p className="m-0 text-muted mt-1 mt-md-0">
                                Showing <span>{perPage * (page - 1)}</span> to{' '}
                                <span>
                                    {parseInt(perPage * (page - 1) + perPage)}
                                </span>{' '}
                                of <span>{total}</span> entries
                            </p>

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
                                previousLinkClassName="page-link"
                                previousClassName="page-item"
                                previousLabel={
                                    <Fragment>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="icon"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path
                                                stroke="none"
                                                d="M0 0h24v24H0z"
                                            />
                                            <polyline points="15 6 9 12 15 18" />
                                        </svg>
                                        prev
                                    </Fragment>
                                }
                                nextLabel={
                                    <Fragment>
                                        next{' '}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="icon"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path
                                                stroke="none"
                                                d="M0 0h24v24H0z"
                                            />
                                            <polyline points="9 6 15 12 9 18" />
                                        </svg>
                                    </Fragment>
                                }
                                pageClassName="page-item"
                                pageLinkClassName="page-link"
                                nextLinkClassName="page-link"
                                nextClassName="page-item"
                                breakLabel="..."
                                containerClassName="pagination m-0 mt-1 mt-md-0"
                                activeClassName="active"
                            />
                        </>
                    }
                    title={
                        <div className="d-flex justify-content-between align-items-center">
                            <Checkbox />
                        </div>
                    }
                >
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center py-5">
                            <div className="spinner-border" role="status"></div>
                        </div>
                    ) : (
                        <Table
                            responsive
                            className="card-table table-vcenter text-nowrap"
                            headerItems={[
                                {
                                    content: null,
                                },
                                ...this.getTableColumns(),
                            ]}
                            bodyItems={[
                                ...this.getTableData()
                            ]}
                        />
                    )}
                </Card>
            </Fragment>
        )
    }
}

export default withResources(ResourceIndex)
