import Qs from 'qs'
import AsyncSelect from 'react-select/async'
import React, { useEffect, useState } from 'react'
import {
    FormComponentProps,
    Label,
    AbstractData,
    Pulse
} from '@tensei/components'

const ManyToMany: React.FC<FormComponentProps> = ({
    field,
    name,
    id,
    value,
    onChange,
    error,
    resource,
    editing,
    editingId
}) => {
    const [hiddenRows, setHiddenRows] = useState<number | null>(null)
    const [defaultValue, setDefaultValue] = useState<any[]>([])
    const [loadingDefault, setLoadingDefault] = useState(editing)

    const relatedResource = window.Tensei.state.resources.find(
        r => r.name === field.name
    )

    if (!relatedResource) {
        return null
    }

    const getQuery = (search?: string) => {
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
        if (editing) {
            window.Tensei.client
                .get(
                    `${resource.slug}/${editingId}/${
                        relatedResource.slug
                    }?${getQuery()}`
                )
                .then(({ data }) => {
                    setDefaultValue(
                        data.data.map((row: AbstractData) => ({
                            label: row[relatedResource.displayFieldSnakeCase],
                            value: row.id
                        }))
                    )

                    if (data.meta.total > data.data.length) {
                        setHiddenRows(data.meta.total - data.data.length)
                    }
                })
                .finally(() => {
                    setLoadingDefault(false)
                })
        }
    }, [])

    console.log(
        '@@@@@@@@',
        'Showing only the first ',
        relatedResource.perPageOptions[0] || 10,
        relatedResource.label.toLowerCase(),
        'There are ',
        hiddenRows,
        ' more ',
        relatedResource.label.toLowerCase()
    )

    return (
        <>
            <Label id={id} label={relatedResource.label} />
            {!loadingDefault ? (
                <AsyncSelect
                    onChange={values =>
                        onChange(values ? values.map(v => v.value) : [])
                    }
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
                            .get(
                                `${relatedResource.slug}?${getQuery(
                                    searchValue
                                )}`
                            )
                            .then(({ data }) =>
                                data.data.map((row: AbstractData) => ({
                                    value: row.id,
                                    label:
                                        row[
                                            relatedResource
                                                .displayFieldSnakeCase
                                        ]
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
        </>
    )
}

export default ManyToMany
