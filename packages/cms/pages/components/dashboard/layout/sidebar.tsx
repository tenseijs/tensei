import { Link, useLocation } from 'react-router-dom'
import React, { useState } from 'react'
import styled from 'styled-components'

import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { CmsRoute } from '@tensei/components'
import { useAuthStore } from '../../../../store/auth'
import { useEffect } from 'react'
import { EuiPopover } from '@tensei/eui/lib/components/popover'
import { EuiFlexGroup, EuiFlexItem } from '@tensei/eui/lib/components/flex'
import { useSidebarStore } from '../../../../store/sidebar'

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
const CollapsedSidbarContainer = styled(Sidebar)`
  width: 90px;
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
const CollapsedTopSidebar = styled(SidebarContainer)`
  a {
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  width: 40px;
  display: flex;
  flex-direction: column;
  text-align: center;
`

const Footer = styled.div`
  height: 160px;
  width: 100%;
  padding: 18px 25px;
  border-top: ${({ theme }) => theme.border.thin};
`
const CollapsedFooter = styled(Footer)`
  svg {
    margin-right: 10px;
  }
`

const CollapsedNavItem = styled.div<{ $active?: boolean; to?: string }>`
  ${({ $active, theme }) =>
    $active
      ? `
  color: ${theme.colors.primary};
  background-color:  ${theme.colors.primaryTransparent} ;
  cursor: pointer;

  svg {
    path {
      fill: ${theme.colors.primary};
    }
  }
  `
      : `
      color: ${theme.colors.text};
  `}
`

const NavItem = styled.div<{
  $active?: boolean
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

  ${({ $active, theme }) =>
    $active
      ? `
  color: ${theme.colors.primary};
  background-color:  ${theme.colors.primaryTransparent} ;
  cursor: pointer;

  svg {
    path {
      fill: ${theme.colors.primary};
    }
  }
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
  $active?: boolean
}>`
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  padding-left: 28px;
  border-radius: 2px;
  transition: all 0.25s ease-in-out;

  ${({ theme, $active }) =>
    $active
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

function SettingsCog() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 10.0001C0 9.13506 0.11 8.29706 0.316 7.49606C0.868465 7.5251 1.4182 7.40081 1.90444 7.13693C2.39068 6.87305 2.79448 6.47985 3.07121 6.00081C3.34793 5.52176 3.48681 4.97552 3.47247 4.42248C3.45814 3.86944 3.29117 3.33113 2.99 2.86706C4.19894 1.67763 5.69079 0.815556 7.325 0.362061C7.57599 0.855533 7.95864 1.26993 8.43058 1.55937C8.90253 1.84881 9.44537 2.00202 9.999 2.00202C10.5526 2.00202 11.0955 1.84881 11.5674 1.55937C12.0394 1.26993 12.422 0.855533 12.673 0.362061C14.3072 0.815556 15.7991 1.67763 17.008 2.86706C16.7065 3.33121 16.5393 3.86973 16.5248 4.42303C16.5104 4.97632 16.6493 5.52283 16.9262 6.00207C17.2031 6.48132 17.6071 6.87463 18.0937 7.13848C18.5802 7.40232 19.1303 7.52643 19.683 7.49706C19.889 8.29706 19.999 9.13506 19.999 10.0001C19.999 10.8651 19.889 11.7031 19.683 12.5041C19.1305 12.4748 18.5806 12.599 18.0942 12.8628C17.6078 13.1266 17.2039 13.5198 16.927 13.9988C16.6502 14.4779 16.5112 15.0242 16.5255 15.5774C16.5398 16.1305 16.7068 16.6689 17.008 17.1331C15.7991 18.3225 14.3072 19.1846 12.673 19.6381C12.422 19.1446 12.0394 18.7302 11.5674 18.4408C11.0955 18.1513 10.5526 17.9981 9.999 17.9981C9.44537 17.9981 8.90253 18.1513 8.43058 18.4408C7.95864 18.7302 7.57599 19.1446 7.325 19.6381C5.69079 19.1846 4.19894 18.3225 2.99 17.1331C3.29151 16.6689 3.45873 16.1304 3.47317 15.5771C3.48761 15.0238 3.3487 14.4773 3.07181 13.998C2.79492 13.5188 2.39085 13.1255 1.90431 12.8616C1.41776 12.5978 0.867704 12.4737 0.315 12.5031C0.11 11.7041 0 10.8661 0 10.0001ZM4.804 13.0001C5.434 14.0911 5.614 15.3461 5.368 16.5241C5.776 16.8141 6.21 17.0651 6.665 17.2741C7.58167 16.4529 8.76931 15.9992 10 16.0001C11.26 16.0001 12.438 16.4711 13.335 17.2741C13.79 17.0651 14.224 16.8141 14.632 16.5241C14.3794 15.32 14.5803 14.0651 15.196 13.0001C15.8106 11.9344 16.797 11.1332 17.966 10.7501C18.0122 10.2511 18.0122 9.74899 17.966 9.25006C16.7966 8.86712 15.8099 8.06588 15.195 7.00006C14.5793 5.93499 14.3784 4.6801 14.631 3.47606C14.2231 3.18598 13.7889 2.93488 13.334 2.72606C12.4176 3.54699 11.2303 4.00067 10 4.00006C8.76931 4.00092 7.58167 3.54722 6.665 2.72606C6.21013 2.93488 5.77589 3.18599 5.368 3.47606C5.62056 4.6801 5.41972 5.93499 4.804 7.00006C4.18937 8.06569 3.20298 8.86691 2.034 9.25006C1.98775 9.74899 1.98775 10.2511 2.034 10.7501C3.20335 11.133 4.19013 11.9342 4.805 13.0001H4.804ZM10 13.0001C9.20435 13.0001 8.44129 12.684 7.87868 12.1214C7.31607 11.5588 7 10.7957 7 10.0001C7 9.20441 7.31607 8.44135 7.87868 7.87874C8.44129 7.31613 9.20435 7.00006 10 7.00006C10.7956 7.00006 11.5587 7.31613 12.1213 7.87874C12.6839 8.44135 13 9.20441 13 10.0001C13 10.7957 12.6839 11.5588 12.1213 12.1214C11.5587 12.684 10.7956 13.0001 10 13.0001ZM10 11.0001C10.2652 11.0001 10.5196 10.8947 10.7071 10.7072C10.8946 10.5196 11 10.2653 11 10.0001C11 9.73484 10.8946 9.48049 10.7071 9.29295C10.5196 9.10542 10.2652 9.00006 10 9.00006C9.73478 9.00006 9.48043 9.10542 9.29289 9.29295C9.10536 9.48049 9 9.73484 9 10.0001C9 10.2653 9.10536 10.5196 9.29289 10.7072C9.48043 10.8947 9.73478 11.0001 10 11.0001Z"
        fill="#282828"
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

function Exit() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.535,12.4927 C12.792,12.4927 13.003,12.7027 13.003,12.9607 L13.003,15.5247 C13.003,15.7827 12.795,15.9997 12.537,15.9997 L12.497,15.9997 L3,15.9997 L3,-0.0003 L12.575,-0.0003 L12.595,0.0007 C12.829,0.0257 12.993,0.2227 12.993,0.4627 L12.993,3.0277 C12.993,3.2847 12.782,3.4947 12.525,3.4947 L12.46,3.4947 C12.203,3.4947 11.993,3.2847 11.993,3.0277 L11.993,0.9997 L4,0.9997 L4,14.9997 L12.01,14.9997 L12.003,12.9607 C12.003,12.7027 12.213,12.4927 12.47,12.4927 L12.535,12.4927 Z M11.4390873,4.90355339 L13.5604076,7.02487373 C14.1461941,7.61066017 14.1461941,8.56040764 13.5604076,9.14619408 L11.4390873,11.2675144 C11.2438252,11.4627766 10.9272427,11.4627766 10.7319805,11.2675144 C10.5367184,11.0722523 10.5367184,10.7556698 10.7319805,10.5604076 L12.8533009,8.4390873 C13.048563,8.24382515 13.048563,7.92724266 12.8533009,7.73198052 L10.7319805,5.61066017 C10.5367184,5.41539803 10.5367184,5.09881554 10.7319805,4.90355339 C10.9272427,4.70829124 11.2438252,4.70829124 11.4390873,4.90355339 Z"
        fill="#df4759"
      />
    </svg>
  )
}

function Home() {
  return (
    <svg
      width="18"
      height="19"
      viewBox="0 0 18 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 17H16V7.97803L9 2.53403L2 7.97803V17H8V11H10V17ZM18 18C18 18.2652 17.8946 18.5196 17.7071 18.7071C17.5196 18.8947 17.2652 19 17 19H1C0.734784 19 0.48043 18.8947 0.292893 18.7071C0.105357 18.5196 2.4071e-07 18.2652 2.4071e-07 18V7.49003C-0.000105484 7.33764 0.0346172 7.18724 0.101516 7.05033C0.168415 6.91341 0.26572 6.79359 0.386 6.70003L8.386 0.478028C8.56154 0.341473 8.7776 0.267334 9 0.267334C9.2224 0.267334 9.43846 0.341473 9.614 0.478028L17.614 6.70003C17.7343 6.79359 17.8316 6.91341 17.8985 7.05033C17.9654 7.18724 18.0001 7.33764 18 7.49003V18Z"
        fill="currentColor"
      />
    </svg>
  )
}
interface CollpsedSidebarProps {
  onCloseSidebar: () => void
  pathname: string
  onLogout: () => void
  SubNav: any[]
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
const CollapsedSidebar: React.FC<CollpsedSidebarProps> = ({
  onCloseSidebar,
  pathname,
  onLogout,
  SubNav
}) => {
  const [isContentPopoverOpen, setIsContentPopoverOpen] = useState(false)
  return (
    <CollapsedSidbarContainer>
      <CollapseExpandIcon onClick={onCloseSidebar}>
        <EuiIcon size="s" type="arrowRight" />
      </CollapseExpandIcon>
      <SidebarContainer>
        <Workspace>
          <EuiFlexGroup direction="column" alignItems="center">
            <Logo
              width={40}
              height={40}
              src={
                'https://res.cloudinary.com/bahdcoder/image/upload/v1630016927/Asset_5_4x_hykfhh.png'
              }
            ></Logo>
          </EuiFlexGroup>
        </Workspace>
        <TopNavItemsWrapper>
          <CollapsedTopSidebar>
            <EuiSpacer size="l" />
            <CollapsedNavItem
              as={Link as any}
              to="/cms"
              $active={pathname.endsWith('/cms')}
            >
              <Home />
            </CollapsedNavItem>
            <EuiSpacer size="m" />
            <CollapsedNavItem>
              <EuiPopover
                onMouseOver={() => setIsContentPopoverOpen(true)}
                button={<QuillPen />}
                isOpen={isContentPopoverOpen}
                closePopover={() => setIsContentPopoverOpen(false)}
                anchorPosition="downLeft"
              >
                {...SubNav}
              </EuiPopover>
            </CollapsedNavItem>
            <EuiSpacer size="m" />

            <EuiSpacer size="s" />
            <CollapsedNavItem
              as={Link as any}
              to="/cms/assets"
              $active={pathname.includes('assets')}
            >
              <Landscape />
            </CollapsedNavItem>
          </CollapsedTopSidebar>
        </TopNavItemsWrapper>
      </SidebarContainer>
      <CollapsedFooter>
        <EuiSpacer size="m" />
        <EuiFlexGroup direction="column" alignItems="center">
          <EuiSpacer size="m" />
          <CollapsedNavItem
            as={Link as any}
            to="/cms/settings/profile"
            $active={pathname.includes('settings')}
          >
            <SettingsCog />
          </CollapsedNavItem>

          <EuiSpacer size="m" />
          <NavItem>
            <EuiIcon type="help" size="m" />
          </NavItem>
          <EuiSpacer size="m" />
          <NavItem as={Link as any} onClick={onLogout}>
            <Exit />
          </NavItem>
        </EuiFlexGroup>

        <EuiSpacer size="s" />
      </CollapsedFooter>
    </CollapsedSidbarContainer>
  )
}

export const SidebarMenu: React.FunctionComponent<SidebarProps> = ({
  children,
  title
}) => {
  const { logout } = useAuthStore()
  const { pathname } = useLocation()
  const [groups, setGroups] = useState(getGroups())
  const { mergePermissions, hasPermission } = useAuthStore()

  const { setSidebarState, sidebarState } = useSidebarStore()
  const onCloseSideBar = () => {
    setSidebarState(!sidebarState)
  }
  const onLogout = async () => {
    await logout()
    window.location.href = window.Tensei.getPath('auth/login')
  }

  const isActive = (path: string) => pathname.includes(`resources/${path}`)

  const items = window.Tensei.state.resources
    .filter(resource => resource.displayInNavigation)
    .map(resource => ({
      name: resource.namePlural,
      path: resource.slugPlural,
      permissions: [
        `index:${resource.slugPlural}`,
        `create:${resource.slugPlural}`,
        `update:${resource.slugPlural}`,
        `delete:${resource.slugPlural}`
      ]
    }))

  const [hasMergedPermissions, setHasMergedPermissions] = useState(false)
  useEffect(() => {
    if (!hasMergedPermissions) {
      mergePermissions()
      setHasMergedPermissions(true)
    }
  })

  const SubNav = items.map(item => {
    let hasAnyPermission = item.permissions.map(permission =>
      hasPermission(permission)
    )
    if (hasAnyPermission.every(permission => permission === false)) return

    return (
      <SubNavItem
        key={item.path}
        $active={isActive(item.path)}
        to={window.Tensei.getPath(`resources/${item.path}`)}
      >
        {item.name}
      </SubNavItem>
    )
  })

  return sidebarState ? (
    <Sidebar>
      <CollapseExpandIcon onClick={onCloseSideBar}>
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

          {...SubNav}

          <EuiSpacer size="s" />
          <NavItem
            as={Link as any}
            to="/cms/assets"
            $active={pathname.includes('assets')}
          >
            <Landscape />

            <EuiText>Assets</EuiText>
          </NavItem>
        </TopNavItemsWrapper>
      </SidebarContainer>

      <Footer>
        <NavItem
          as={Link as any}
          to="/cms/settings/profile"
          $active={pathname.includes('settings')}
        >
          <SettingsCog />
          <EuiText>Settings</EuiText>
        </NavItem>
        <EuiSpacer size="s" />
        <NavItem>
          <EuiIcon type="help" />
          <EuiText>Help</EuiText>
        </NavItem>
        <EuiSpacer size="s" />
        <NavItem as={Link as any} onClick={onLogout}>
          <Exit />
          <EuiText color="danger">Logout</EuiText>
        </NavItem>
      </Footer>
    </Sidebar>
  ) : (
    <CollapsedSidebar
      onCloseSidebar={onCloseSideBar}
      pathname={pathname}
      onLogout={onLogout}
      SubNav={SubNav}
    />
  )
}
