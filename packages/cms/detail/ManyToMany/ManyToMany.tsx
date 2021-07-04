import React from 'react'
import { DetailComponentProps } from '@tensei/components'

import Resource from '../../pages/Resource'

const ManyToMany: React.FC<DetailComponentProps> = ({
  detailId,
  field,
  resource
}) => {
  const relatedResource = window.Tensei.state.resources.find(
    r => r.name === field.name
  )

  if (!relatedResource) {
    return null
  }

  return (
    <Resource
      baseResource={resource}
      detailId={detailId}
      relatedResource={relatedResource}
    />
  )
}

export default ManyToMany
