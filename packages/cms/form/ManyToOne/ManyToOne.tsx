import Qs from 'qs'
import AsyncSelect from 'react-select/async'
import React, { useEffect, useState } from 'react'
import {
  FormComponentProps,
  Label,
  AbstractData,
  Pulse
} from '@tensei/components'

const ManyToOne: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  value,
  onChange,
  error,
  editing
}) => {
  const [defaultValue, setDefaultValue] = useState<any>(null)
  const [loadingDefault, setLoadingDefault] = useState(
    editing ? (value ? true : false) : false
  )
  const relatedResource = window.Tensei.state.resources.find(
    r => r.name === field.name
  )

  if (!relatedResource) {
    return null
  }

  const getQuery = (search: string) => {
    const searchableFields = relatedResource.fields.filter(
      field => field.isSearchable
    )

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

    parameters.fields = `id,${relatedResource.displayFieldSnakeCase}`

    parameters.page = 1
    parameters.per_page = relatedResource.perPageOptions[0] || 10

    return Qs.stringify(parameters, { encodeValuesOnly: true })
  }

  useEffect(() => {
    if (editing && value) {
      window.Tensei.client
        .get(`${relatedResource.slug}/${value}`)
        .then(({ data }) => {
          setDefaultValue({
            label: data.data[relatedResource.displayFieldSnakeCase],
            value: data.data.id
          })
        })
        .finally(() => {
          setLoadingDefault(false)
        })
    }
  }, [])

  return (
    <>
      <Label id={id} label={field.label || field.name} />
      {!loadingDefault ? (
        <AsyncSelect
          onChange={option => onChange(option.value)}
          name={name}
          id={id}
          defaultValue={editing ? defaultValue : undefined}
          className={`react-select-container ${
            error ? 'react-select-container--error' : ''
          }`}
          classNamePrefix="react-select"
          cacheOptions
          defaultOptions
          loadOptions={searchValue =>
            window.Tensei.client
              .get(`${relatedResource.slug}?${getQuery(searchValue)}`)
              .then(({ data }) =>
                data.data.map((row: AbstractData) => ({
                  value: row.id,
                  label: row[relatedResource.displayFieldSnakeCase]
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

      {error ? (
        <i className="text-tensei-error inline-block mt-2 text-sm">{error}</i>
      ) : null}
    </>
  )
}

export default ManyToOne
