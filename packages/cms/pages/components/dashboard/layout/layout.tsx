import React from 'react'
import styled from 'styled-components'

import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { AvatarContextMenu } from './avatar-context-menu'
import { TopbarMenu } from '../layout/topbar'
import { SidebarMenu } from '../layout/sidebar'

const StyledSidebar = styled.div<{
  bg?: string
}>`
  display: flex;
  flex-direction: column;
  width: 64px;
  height: 100%;
  position: relative;
  border-right: ${({ theme }) => theme.border.thin};
`

const SidebarWrapper = styled.div`
  display: flex;
  height: 100%;
`

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  background-color: #fff;
`

const Workspace = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 75px;
  border-bottom: ${({ theme }) => theme.border.thin};
`

const GroupName = styled(EuiText)`
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  ${({ theme }) => `color: ${theme.colors.subdued}`}
`

const SidebarContainer = styled.div`
  flex-grow: 1;
`

const Footer = styled.div`
  height: 170px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1rem;
  border-top: ${({ theme }) => theme.border.thin};
`

const NavItem = styled.button<{
  active?: boolean
}>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  ${({ active, theme }) =>
    active
      ? `
    background-color: ${theme.colors.primaryTransparent};
    border-radius: ${theme.border.radius.medium};
    `
      : ``}

  svg {
    width: 1.25rem;
    height: 1.25rem;
    fill: currentColor;
    ${({ active, theme }) =>
      active
        ? `
    color: ${theme.colors.primaryText};
    `
        : ``}
  }
`

const Logo = styled.img`
  ${({ theme }) => `border-radius: 10px;`}
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
`

const Content = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  overflow-y: auto;
  overflow-x: hidden;
`

interface SidebarProps {
  title: string
  hideNestedSidebar?: boolean
}

const Sidebar: React.FunctionComponent<SidebarProps> = ({
  title,
  children,
  hideNestedSidebar
}) => {
  return (
    <SidebarWrapper>
      <StyledSidebar>
        <SidebarContainer>
          <Workspace>
            <Logo
              width={40}
              height={40}
              src={
                'https://res.cloudinary.com/bahdcoder/image/upload/v1630016927/Asset_5_4x_hykfhh.png'
              }
            ></Logo>
          </Workspace>

          <EuiSpacer size="l" />

          <GroupName textAlign="center">Main</GroupName>

          <EuiSpacer size="l" />

          <GroupName textAlign="center">Team</GroupName>
        </SidebarContainer>

        <Footer>
          <NavItem active>
            <EuiIcon type="gear" />
          </NavItem>
          <EuiSpacer size="s" />
          <NavItem>
            <EuiIcon type="help" />
          </NavItem>

          <AvatarContextMenu />
        </Footer>
      </StyledSidebar>

      {hideNestedSidebar ? null : (
        <SidebarMenu title={title} groups={[]}>
          {children}
        </SidebarMenu>
      )}
    </SidebarWrapper>
  )
}

export const DashboardLayout: React.FunctionComponent & {
  Content: typeof Content
  Body: typeof Body
  Sidebar: typeof Sidebar
  Topbar: typeof TopbarMenu
} = ({ children }) => {
  return <Wrapper>{children}</Wrapper>
}

DashboardLayout.Content = Content
DashboardLayout.Body = Body
DashboardLayout.Topbar = TopbarMenu
DashboardLayout.Sidebar = Sidebar
