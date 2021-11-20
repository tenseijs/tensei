import React from 'react'
import styled from 'styled-components'

import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { useEuiTheme } from '@tensei/eui/lib/services/theme'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { EuiButton } from '@tensei/eui/lib/components/button'
import { EuiButtonEmpty } from '@tensei/eui/lib/components/button/button_empty'
import { AvatarContextMenu } from './avatar-context-menu'

import { SidebarMenu } from './sidebar'

const Sidebar = styled.div<{
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

const Topbar = styled.div`
  width: 100%;
  padding: 17px 40px;
  position: sticky;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: ${({ theme }) => theme.border.thin};
`

const Content = styled.div`
  width: 100%;
  padding: 40px;
  margin-bottom: 40px;
  flex-grow: 1;
  display: flex;
  overflow-y: auto;
  overflow-x: hidden;
`


const TitleAndBackButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

export const DashboardLayout: React.FunctionComponent = ({ children }) => {
  const { euiTheme } = useEuiTheme()

  return (
    <Wrapper>
      <SidebarWrapper>
        <Sidebar>
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
        </Sidebar>
        <SidebarMenu />
      </SidebarWrapper>
      <Body>
        <Topbar>
          <TitleAndBackButtonContainer>
            <EuiButtonEmpty iconType="arrowLeft" href="/back">
              Back
            </EuiButtonEmpty>
            <EuiTitle size="xs">
              <h3>Content</h3>
            </EuiTitle>
          </TitleAndBackButtonContainer>

          <EuiButton fill color="primary">
            Add new product
          </EuiButton>
        </Topbar>

        <Content>{children}</Content>
      </Body>
    </Wrapper>
  )
}
