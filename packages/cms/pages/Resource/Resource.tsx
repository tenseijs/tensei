import Qs from 'qs'
import { throttle } from 'throttle-debounce'
import Paginator from '../../components/Paginator'
import React, { useState, useCallback, useEffect, Fragment } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { Transition, Dialog } from '@headlessui/react'
import {
  Table,
  SearchInput,
  Select,
  Button,
  Heading,
  ResourceContract,
  PaginatedData,
  AbstractData,
  DeleteModal
} from '@tensei/components'
import { TableRow } from '@tensei/components/lib/Table/Table'

export interface ResourceProps {
  detailId?: string
  baseResource: ResourceContract
  relatedResource?: ResourceContract
}

const Resource: React.FC<ResourceProps> = ({
  baseResource,
  relatedResource,
  detailId
}) => {
  const resource = relatedResource ? relatedResource : baseResource
  const history = useHistory()
  const location = useLocation()
  const [selected, setSelected] = useState<TableRow[]>([])
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(false)
  const fields = resource.fields.filter(field => field.showOnIndex)

  const relatedField = baseResource.fields.find(
    f =>
      f.name === relatedResource?.name &&
      ['OneToMany', 'ManyToMany'].includes(f.fieldName)
  )

  if (!relatedField && relatedResource) {
    return null
  }

  const searchableFields = resource.fields.filter(field => field.isSearchable)

  const getDefaultParametersFromSearch = () => {
    const searchQuery = Qs.parse(location.search.split('?')[1])

    const sort = ((searchQuery[`${resource.slug}_sort`] as string) || '').split(
      '___'
    )

    return {
      page: searchQuery[`${resource.slug}_page`] || 1,
      per_page:
        searchQuery[`${resource.slug}_per_page`] ||
        resource.perPageOptions[0] ||
        10,
      sort: sort
        ? {
            field: sort[0],
            direction: sort[1]
          }
        : {}
    }
  }

  const defaultParams = getDefaultParametersFromSearch()

  const getDefaultData = () => ({
    meta: {
      page: parseInt(defaultParams.page as string),
      per_page: parseInt(defaultParams.per_page as string)
    },
    data: [],
    sort: defaultParams.sort as any
  })

  const [data, setData] = useState<PaginatedData>(getDefaultData())

  const [loading, setLoading] = useState(true)

  const getSearchString = () => {
    const parameters: any = {
      [`${resource.slug}_page`]: data.meta.page,
      [`${resource.slug}_per_page`]: data.meta.per_page
    }

    if (data.sort?.field) {
      parameters[
        `${resource.slug}_sort`
      ] = `${data.sort?.field}___${data.sort?.direction}`
    }

    if (search) {
      parameters[`${resource.slug}_search`] = search
    }

    return Qs.stringify(parameters, { encodeValuesOnly: true })
  }

  const getQuery = () => {
    let parameters: any = {
      where: {}
    }

    if (search) {
      parameters.where._or = searchableFields.map(field => ({
        [field.inputName]: {
          _like: `%${search}%`
        }
      }))
    }

    if (data.sort?.field) {
      parameters.sort = `${data.sort.field}:${data.sort.direction}`
    }

    parameters.page = data.meta.page
    parameters.per_page = data.meta.per_page

    return Qs.stringify(parameters, { encodeValuesOnly: true })
  }

  const fetchData = useCallback(
    throttle(700, (currentData: PaginatedData, slug: string, query: string) => {
      setLoading(true)

      window.Tensei.client
        .get(
          relatedResource
            ? `${baseResource.slug}/${detailId}/${relatedField?.inputName}?${query}`
            : `${slug}?${query}`
        )
        .then(({ data: payload }) => {
          setData({
            ...currentData,
            data: payload.data,
            meta: payload.meta
          })
          setLoading(false)
        })
    }),
    []
  )

  useEffect(() => {
    setData(getDefaultData())
  }, [resource.slug])

  useEffect(() => {
    fetchData(data, resource.slug, getQuery())

    history.push({
      pathname: location.pathname,
      search: getSearchString()
    })
  }, [data.meta.per_page, data.meta.page, data.sort, search])

  const computePaginationValues = () => {
    const to = data.meta.per_page * data.meta.page

    return {
      from: data.meta.per_page * (data.meta.page - 1) + 1,
      to: data.meta.total && data.meta.total <= to ? data.meta.total : to,
      total: data.meta.total
    }
  }

  const paginationValues = computePaginationValues()

  const columns = [
    ...fields.map(field => ({
      title: field.name,
      field: field.inputName,
      sorter: field.isSortable,
      render: (value: string, row: any) => {
        const Component =
          window.Tensei.components.index[field.component.index] ||
          window.Tensei.components.index.Text

        return (
          <Component
            field={field}
            values={row}
            value={row[field.inputName]}
            resource={resource}
          />
        )
      }
    }))
  ].filter(Boolean)

  return (
    <>
      <DeleteModal
        resource={resource}
        selected={selected}
        setOpen={() => setDeleting(false)}
        open={deleting && selected.length > 0}
        onDelete={() => fetchData(data, resource.slug, getQuery())}
      />

      <>
        <div className="overflow-hidden border-t border-b border-tensei-gray-600 rounded">
          <div className="flex items-center w-full border-b border-tensei-gray-600 px-6 py-2 text-13px">
            <span>
              {selected.length} {selected.length === 1 ? 'item' : 'items'}{' '}
              selected
            </span>

            {selected.length > 0 && (
              <button className="ml-2">Clear selection</button>
            )}

            {selected.length > 0 && (
              <button
                onClick={() => setDeleting(true)}
                className="flex items-center ml-2 px-2.5 py-0.5 rounded text-xs font-medium hover:bg-red-700 hover:bg-opacity-10 text-red-700 transition ease-in-out"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span style={{ marginTop: '0.5px' }}>Delete</span>
              </button>
            )}
          </div>
          <Table
            sort={data.sort}
            loading={loading}
            columns={columns as any[]}
            onSort={sort => setData({ ...data, sort })}
            rows={data.data as any}
            selection={{
              onChange: (keys, rows) => setSelected(rows)
            }}
            Empty={() => (
              <tr className="h-24">
                <td colSpan={columns.length + 1}>
                  <div className="w-full h-full flex flex-col items-center justify-center my-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={65}
                      height={51}
                      viewBox="0 0 65 51"
                      className="mb-4 text-tensei-gray-500 fill-current"
                    >
                      <path d="M56 40h2c.552285 0 1 .447715 1 1s-.447715 1-1 1h-2v2c0 .552285-.447715 1-1 1s-1-.447715-1-1v-2h-2c-.552285 0-1-.447715-1-1s.447715-1 1-1h2v-2c0-.552285.447715-1 1-1s1 .447715 1 1v2zm-5.364125-8H38v8h7.049375c.350333-3.528515 2.534789-6.517471 5.5865-8zm-5.5865 10H6c-3.313708 0-6-2.686292-6-6V6c0-3.313708 2.686292-6 6-6h44c3.313708 0 6 2.686292 6 6v25.049375C61.053323 31.5511 65 35.814652 65 41c0 5.522847-4.477153 10-10 10-5.185348 0-9.4489-3.946677-9.950625-9zM20 30h16v-8H20v8zm0 2v8h16v-8H20zm34-2v-8H38v8h16zM2 30h16v-8H2v8zm0 2v4c0 2.209139 1.790861 4 4 4h12v-8H2zm18-12h16v-8H20v8zm34 0v-8H38v8h16zM2 20h16v-8H2v8zm52-10V6c0-2.209139-1.790861-4-4-4H6C3.790861 2 2 3.790861 2 6v4h52zm1 39c4.418278 0 8-3.581722 8-8s-3.581722-8-8-8-8 3.581722-8 8 3.581722 8 8 8z" />
                    </svg>
                    <p>
                      No {resource.name.toLowerCase()} matched the given
                      criteria.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between">
          <Select
            className="w-full md:w-auto mb-3 md:mb-0"
            roundedFull
            hideFirstOption
            options={
              resource.perPageOptions?.map(option => ({
                value: option,
                label: `${option} / page`
              })) || []
            }
            value={data.meta.per_page}
            onChange={event =>
              setData({
                ...data,
                meta: {
                  ...data.meta,
                  per_page: parseInt(event.target.value, 10)
                }
              })
            }
          />

          {data?.meta?.total && data.meta.total > 0 ? (
            <div className="hidden md:block">
              <p className="">
                Showing
                <span className="font-medium mx-1">
                  {paginationValues.from}
                </span>
                to
                <span className="font-medium mx-1">{paginationValues.to}</span>
                of
                <span className="font-medium mx-1">
                  {paginationValues.total}
                </span>
                results
              </p>
            </div>
          ) : null}

          {loading &&
          data.meta &&
          data.meta.page &&
          data.meta.total === 0 ? null : (
            <Paginator
              page={data.meta.page - 1}
              page_count={data.meta.page_count!}
              onPageChange={({ selected }) => {
                setData({
                  ...data,
                  meta: {
                    ...data.meta,
                    page: selected + 1
                  }
                })
              }}
            />
          )}
        </div>
      </>
    </>
  )
}

export default Resource
