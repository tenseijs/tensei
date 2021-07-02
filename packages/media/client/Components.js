import React, { useState, useEffect } from 'react'
import { Pulse, Label, Button, Modal } from '@tensei/components'

import Card from './Card'
import { Media } from './Media'

export const DetailFile = ({ detailId, resource, field }) => {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)

    const relatedField = resource.fields.find(
        field => field.name === 'File' && ['OneToOne'].includes(field.fieldName)
    )

    if (!relatedField) {
        return null
    }

    const fetchData = () => {
        setData({})
        setLoading(true)

        window.Tensei.client
            .get(`${resource.slug}/${detailId}/${relatedField.inputName}`)
            .then(({ data }) => {
                setData(data.data)
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchData()
    }, [])

    return loading ? (
        <Pulse
            height="10px"
            dotHeight="100%"
            dotClassName="bg-tensei-primary"
        />
    ) : data ? (
        <div className="media-w-full sm:media-w-72">
            <Card file={data} />
        </div>
    ) : null
}

export const DetailFiles = ({ detailId, resource }) => {
    return <Media detailId={detailId} relatedResource={resource} />
}

export const IndexFile = () => {}

export const FormFiles = props => {
    return (
        <window.Tensei.components.form.ManyToMany
            {...props}
            customQuery={params => {
                params.where._and = [
                    {
                        file: {
                            _eq: null
                        }
                    }
                ]
                return params
            }}
        />
    )
}

export const FormFile = ({ id, field, onChange, value, editing, editingId, resource }) => {
    const [picking, setPicking] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState(null)
    const label = field.label || field.name
    const fileResource = window.Tensei.state.resourcesMap['files']

    const relatedField = resource.fields.find(
        field => field.name === 'File' && ['OneToOne'].includes(field.fieldName)
    )

    const fetchFile = () => {
        setLoading(true)

        window.Tensei.client
            .get(`${resource.slug}/${editingId}/${relatedField.inputName}`)
            .then(({ data }) => {
                setSelected(data.data)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        if (editing && editingId) {
            fetchFile()
        }
    }, [])

    return (
        <>
            <Label id={id} label={label} />
            {selected ? (
                <div className="mt-5">
                    <Card file={selected} />
                </div>
            ) : null}
            {loading ? (
                <div className="media-w-full media-py-12 media-flex media-justify-center media-items-center">
                    <Pulse dotClassName="media-bg-tensei-primary" />
                </div>
            ) : (
                <div className="mt-5">
                    <Button onClick={() => setPicking(true)} secondary>{selected ? 'Replace' : 'Choose'} file</Button>
                </div>
            )}

            <Modal
                noPadding
                open={picking}
                setOpen={setPicking}
                width='80%'
                height='80vh'
                className="align-top mt-24"
                title={`Select ${label}`}
            >
                {picking ? <Media hideTitle selectOnlyOne onSelected={selected => {
                    setPicking(false)

                    if (selected.length > 0) {
                        onChange(selected[0].id)
                        setSelected(selected[0])
                    }
                }} /> : null}
            </Modal>
        </>
    )
}
