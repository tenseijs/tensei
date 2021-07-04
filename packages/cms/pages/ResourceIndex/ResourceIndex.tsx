import React from 'react'
import { useParams, Redirect } from 'react-router-dom'

import Resource from '../Resource'
import PageWrapper from '../../components/PageWrapper'

export interface ResourceIndexProps {}

const ResourceIndex: React.FC<ResourceIndexProps> = () => {
  const params = useParams<{
    resource: string
  }>()

  const resource = window.Tensei.state.resourcesMap[params.resource]

  if (!resource) {
    return <Redirect to={window.Tensei.getPath('404')} />
  }

  if (!window.Tensei.state.permissions[`index:${resource.slug}`]) {
    return <Redirect to={window.Tensei.getPath('404')} />
  }

  return (
    <PageWrapper>
      <Resource baseResource={resource} />
    </PageWrapper>
  )
}

export default ResourceIndex
