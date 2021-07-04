import { Pulse } from '@tensei/components'
import React, { useState, useEffect } from 'react'

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
    <Pulse height="10px" dotHeight="100%" dotClassName="bg-tensei-primary" />
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

export const FormFile = props => {
  return <window.Tensei.components.form.OneToOne {...props} />
}
