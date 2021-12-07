import { Link, useLocation } from 'react-router-dom'
import React, { useState } from 'react'
import styled from 'styled-components'

import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { CmsRoute } from '@tensei/components'

const CollapseExpandIcon = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  position: absolute;
  border: ${({ theme }) => theme.border.thin};
  top: 23.5px;
  right: -14px;
  z-index: 99;
  background-color: ${({ theme }) => theme.colors.ghost};
`

const Sidebar = styled.div<{
  bg?: string
}>`
  display: flex;
  flex-direction: column;
  width: 248px;
  height: 100%;
  position: relative;
  border-right: ${({ theme }) => theme.border.thin};
  background-color: ${({ theme }) => theme.colors.bgShade};
`

const Workspace = styled.div`
  padding: 18px 25px;
  display: flex;
  align-items: center;
  height: 75px;
`

const SidebarContainer = styled.div`
  flex-grow: 1;
`

const Footer = styled.div`
  height: 160px;
  width: 100%;
  padding: 18px 25px;
  border-top: ${({ theme }) => theme.border.thin};
`

const NavItem = styled.div<{
  active?: boolean
  to?: string
}>`
  display: flex;
  position: relative;
  align-items: center;

  padding: 4px;

  svg {
    margin-right: 10px;
  }

  div {
    font-weight: 400;
  }

  &:hover {
  }

  ${({ active, theme }) =>
    active
      ? `
  color: ${theme.colors.primary};
  background-color: ${theme.colors.primaryTransparent};
  cursor: pointer;
  `
      : `
      color: ${theme.colors.text};
  `}
`

const TopNavItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 24px;
`

const WorkspaceName = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 12px;
`

const ResourcesCountBadge = styled.span`
  width: 21px;
  height: 21px;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  position: absolute;
  right: 0;
  font-weight: 400;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primaryTransparent};
`

const NestedSidebarTitleUnderline = styled.div`
  width: 25%;
  margin: 0 1.75rem;
  ${({ theme }) => `border-bottom: ${theme.border.thin}`}
`

const SubNavItem = styled(Link)<{
  active?: boolean
}>`
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  padding-left: 28px;
  border-radius: 2px;
  transition: all 0.25s ease-in-out;

  ${({ theme, active }) =>
    active
      ? `
    color: ${theme.colors.primary};
    background-color: ${theme.colors.primaryTransparent};
      `
      : `
    color: ${theme.colors.text};
    &:hover {
      color: ${theme.colors.primary};
    }
  `}
`

const Logo = styled.img``
export interface SidebarNavGroup {
  name: string
  items: SidebarNavItem[]
}

export interface SidebarNavItem {
  name: string
  link: string
}

interface SidebarProps {
  title: string
  groups: SidebarNavGroup[]
}

function QuillPen() {
  return (
    <svg
      width={18}
      height={20}
      viewBox="0 0 18 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.94 12.036C3.707 12.66 3.51 13.236 3.334 13.819C4.294 13.122 5.435 12.68 6.752 12.515C9.265 12.201 11.498 10.542 12.628 8.457L11.172 7.002L12.585 5.587L13.585 4.586C14.015 4.156 14.5 3.362 15.013 2.218C9.42 3.085 5.995 6.51 3.939 12.036H3.94ZM14 7.001L15 8C14 11 11 14 7 14.5C4.331 14.834 2.664 16.667 1.998 20H0C1 14 3 0 18 0C17 2.997 16.002 4.996 15.003 5.997L14 7.001Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Landscape() {
  return (
    <svg
      width={21}
      height={18}
      style={{ marginTop: '-4px' }}
      viewBox="0 0 21 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.27 9.216L13 3L21 18H0L7 5L9.27 9.216ZM10.39 11.238L12.987 16H17.667L12.897 7.058L10.39 11.238ZM3.348 16H10.652L7 9.219L3.348 16ZM3.5 5C2.83696 5 2.20107 4.73661 1.73223 4.26777C1.26339 3.79893 1 3.16304 1 2.5C1 1.83696 1.26339 1.20107 1.73223 0.732233C2.20107 0.263392 2.83696 0 3.5 0C4.16304 0 4.79893 0.263392 5.26777 0.732233C5.73661 1.20107 6 1.83696 6 2.5C6 3.16304 5.73661 3.79893 5.26777 4.26777C4.79893 4.73661 4.16304 5 3.5 5Z"
        fill="currentColor"
      />
    </svg>
  )
}

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
        path: window.Tensei.getPath(`resources/${resource.slug}`),
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

export const SidebarMenu: React.FunctionComponent<SidebarProps> = ({
  children,
  title
}) => {
  const { pathname } = useLocation()
  const [groups, setGroups] = useState(getGroups())
  const [close, setClose] = useState(false)

  const onCloseSideBar = () => setClose(!close)

  const isActive = (path: string) => pathname.includes(`resources/${path}`)

  const items = window.Tensei.state.resources
    .filter(resource => resource.displayInNavigation)
    .map(resource => ({
      name: resource.namePlural,
      path: resource.slugPlural
    }))

  return (
    <Sidebar>
      <CollapseExpandIcon>
        <EuiIcon size="s" type="arrowLeft" />
      </CollapseExpandIcon>

      <SidebarContainer>
        <Workspace>
          <Logo
            width={40}
            height={40}
            src={
              'https://res.cloudinary.com/bahdcoder/image/upload/v1630016927/Asset_5_4x_hykfhh.png'
            }
          ></Logo>
          <WorkspaceName>
            <EuiTitle size="xs">
              <h1>Tensei</h1>
            </EuiTitle>
            <EuiText size="xs" color="slategray">
              Workspace
            </EuiText>
          </WorkspaceName>
        </Workspace>

        <NestedSidebarTitleUnderline />

        <EuiSpacer size="l" />

        <TopNavItemsWrapper>
          <NavItem>
            <QuillPen />

            <EuiText>Content</EuiText>
            <ResourcesCountBadge>{items.length}</ResourcesCountBadge>
          </NavItem>

          <EuiSpacer size="s" />

          {items.map(item => (
            <SubNavItem
              key={item.path}
              active={isActive(item.path)}
              to={window.Tensei.getPath(`resources/${item.path}`)}
            >
              {item.name}
            </SubNavItem>
          ))}

          <EuiSpacer size="s" />
          <NavItem
            as={Link as any}
            to="/cms/assets"
            active={pathname.includes('assets')}
          >
            <Landscape />

            <EuiText>Assets</EuiText>
          </NavItem>
        </TopNavItemsWrapper>
      </SidebarContainer>

      <Footer>
        <NavItem>
          <EuiIcon type="gear" />
          <EuiText>Settings</EuiText>
        </NavItem>
        <EuiSpacer size="s" />
        <NavItem>
          <EuiIcon type="help" />
          <EuiText>Help</EuiText>
        </NavItem>
      </Footer>
    </Sidebar>
  )
}
