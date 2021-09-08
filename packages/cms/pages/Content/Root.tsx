import { useLocation, Link, useHistory } from 'react-router-dom'
import React, { FunctionComponent, useEffect, useState } from 'react'
import {
  PageWrapper,
  ActionButton,
  Button,
  DynamicSidebar,
  CmsRoute,
  ResourceContract
} from '@tensei/components'

import Resource from '../Resource'

const getGroups = () => {
  const { resources } = window.Tensei.state

  const sidebarResources = resources.filter(r => r.displayInNavigation)

  let groups: {
    slug: string
    label: string
    active?: boolean
    routes: CmsRoute[]
  }[] = []

  sidebarResources.forEach(resource => {
    if (resource.group && resource.groupSlug) {
      const resourceRoute = {
        settings: false,
        group: resource.group,
        name: resource.label,
        icon: resource.icon,
        path: window.Tensei.getPath(`content/${resource.slug}`),
        requiredPermissions: [`index:${resource.slug}`],
        component: () => <p></p>
      }

      const existingGroup = groups.findIndex(g => g.slug === resource.groupSlug)

      if (existingGroup === -1) {
        groups.push({
          active: true,
          slug: resource.groupSlug,
          label: resource.group,
          routes: [resourceRoute]
        })
      } else {
        groups[existingGroup] = {
          ...groups[existingGroup],
          routes: [...groups[existingGroup].routes, resourceRoute]
        }
      }
    }
  })

  const routes = window.Tensei.ctx.routes.filter(r => !r.settings)

  routes.forEach(route => {
    if (route.group) {
      const existingGroup = groups.findIndex(g => g.label === route.group)

      if (existingGroup === -1) {
        groups.push({
          label: route.group,
          slug: '',
          active: true,
          routes: [route]
        })
      } else {
        groups[existingGroup] = {
          ...groups[existingGroup],
          routes: [...groups[existingGroup].routes, route]
        }
      }
    }
  })

  return groups
}

export interface ContentRootProps {}

export const ContentRoot: FunctionComponent<ContentRootProps> = () => {
  const groups = getGroups()
  const history = useHistory()
  const location = useLocation()
  const [resource, setResource] = useState<ResourceContract>()

  const findResourceFromPath = (path: string) => {
    const [, slug] = path.split(`${window.Tensei.getPath('content')}/`)

    const selectedResource = window.Tensei.state.resources.find(
      resource => resource.slug === slug
    )

    if (selectedResource) {
      setResource(selectedResource)
    } else {
      history.push(window.Tensei.getPath(''))
    }
  }

  useEffect(() => {
    findResourceFromPath(location.pathname)
  }, [location.pathname])

  return (
    <PageWrapper
      noPadding
      renderTopBarContent={() => (
        <>
          <div className="flex-1 flex items-center">
            <h2 className="text-tensei-darkest font-bold">{resource?.label}</h2>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            <div className="mr-3">
              <ActionButton
                actions={[
                  {
                    title: 'Save as PDF',
                    onClick: console.log
                  }
                ]}
              >
                Actions
              </ActionButton>
            </div>
            <Button primary>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Create item
            </Button>
          </div>
        </>
      )}
      renderDynamicSidebarContent={() => (
        <DynamicSidebar title="Content">
          {groups.map((group, index) => {
            const groupRoutes = group.routes

            if (groupRoutes.length === 0) {
              return null
            }

            return (
              <DynamicSidebar.DynamicSidebarGroup
                key={group.slug}
                title={group.label}
              >
                {groupRoutes.map(route => (
                  <DynamicSidebar.DynamicSidebarLink
                    key={route.name}
                    as={Link}
                    to={route.path}
                    active={location.pathname.includes(route.path)}
                  >
                    {route.name}
                  </DynamicSidebar.DynamicSidebarLink>
                ))}
              </DynamicSidebar.DynamicSidebarGroup>
            )
          })}
        </DynamicSidebar>
      )}
    >
      {resource ? <Resource baseResource={resource} /> : null}
    </PageWrapper>
  )
}
