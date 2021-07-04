import Qs from 'qs'
import { Link } from 'react-router-dom'
import AsyncSelect from 'react-select/async'
import React, { useEffect, useState } from 'react'
import {
  FormComponentProps,
  Label,
  AbstractData,
  Pulse
} from '@tensei/components'

const ManyToMany: React.FC<
  FormComponentProps & {
    customQuery?: (parameters: AbstractData) => AbstractData
  }
> = ({
  field,
  name,
  id,
  onChange,
  resource,
  editing,
  editingId,
  customQuery
}) => {
  const [hiddenRows, setHiddenRows] = useState<number | null>(null)
  const [defaultValue, setDefaultValue] = useState<any[]>([])
  const [loadingDefault, setLoadingDefault] = useState(editing)

  const relatedResource = window.Tensei.state.resources.find(
    r => r.name === field.name
  )

  const relationField = resource.fields.find(
    field =>
      field.name === relatedResource?.name &&
      ['ManyToMany', 'OneToMany'].includes(field.fieldName)
  )

  if (!relatedResource || !relationField) {
    return null
  }

  const getQuery = (search?: string) => {
    const searchableFields = relatedResource.fields.filter(
      field => field.isSearchable
    )

    let parameters: AbstractData = {
      where: {}
    }

    if (search) {
      parameters.where._or = searchableFields.map(field => ({
        [field.inputName]: {
          _like: `%${search}%`
        }
      }))
    }

    parameters.fields = `id,${relatedResource.displayFieldSnakeCase},${relatedResource.secondaryDisplayFieldSnakeCase}`

    parameters.page = 1
    parameters.per_page = relatedResource.perPageOptions[0] || 10

    return Qs.stringify(customQuery ? customQuery(parameters) : parameters, {
      encodeValuesOnly: true
    })
  }

  useEffect(() => {
    if (editing) {
      window.Tensei.client
        .get(
          `${resource.slug}/${editingId}/${
            relationField.inputName
          }?${getQuery()}`
        )
        .then(({ data: responseData }) => {
          setDefaultValue(
            responseData.data.map((row: AbstractData) => ({
              label:
                row[relatedResource.displayFieldSnakeCase] ||
                row[relatedResource.secondaryDisplayFieldSnakeCase],
              value: row.id
            }))
          )

          if (responseData.meta.total > responseData.data.length) {
            setHiddenRows(responseData.meta.total - responseData.data.length)
          }
        })
        .finally(() => {
          setLoadingDefault(false)
        })
    }
  }, [])

  return (
    <>
      <Label id={id} label={field.label || relatedResource.label} />
      {!loadingDefault ? (
        <AsyncSelect
          onChange={values => onChange(values ? values.map(v => v.value) : [])}
          name={name}
          id={id}
          isMulti
          defaultValue={editing ? defaultValue : undefined}
          className="react-select-container"
          classNamePrefix="react-select"
          cacheOptions
          defaultOptions
          loadOptions={searchValue =>
            window.Tensei.client
              .get(`${relatedResource.slug}?${getQuery(searchValue)}`)
              .then(({ data }) =>
                data.data.map((row: AbstractData) => ({
                  value: row.id,
                  label:
                    row[relatedResource.displayFieldSnakeCase] ||
                    row[relatedResource.secondaryDisplayFieldSnakeCase]
                }))
              )
          }
        />
      ) : (
        <div className="w-full flex justify-center mt-2">
          <Pulse
            dotClassName="bg-tensei-primary"
            height="10px"
            dotHeight="100%"
          />
        </div>
      )}
      {!loadingDefault && hiddenRows && hiddenRows !== 0 && editing ? (
        <p className="text-tensei-primary font-semibold italic text-sm mt-3">
          Showing only the first {relatedResource.perPageOptions[0] || 10}{' '}
          {relatedResource.label.toLowerCase()}.{' '}
          <Link
            className="border-b border-tensei-primary"
            to={window.Tensei.getPath(
              `resources/${resource.slug}/${editingId}`
            )}
          >
            View the remaining {hiddenRows}{' '}
            {relatedResource.label.toLowerCase()}.
          </Link>
        </p>
      ) : null}
    </>
  )
}

export default ManyToMany
