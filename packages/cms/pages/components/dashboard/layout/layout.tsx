import React from 'react'
import styled from 'styled-components'

import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { useEuiTheme } from '@tensei/eui/lib/services/theme'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { EuiButton } from '@tensei/eui/lib/components/button'

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

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
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

const NavItem = styled.div`
  display: flex;
  align-items: center;

  svg {
    margin-right: 10px;
  }
`

const WorkspaceName = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 12px;
`

const Logo = styled.img``

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
  background-color: ${({ theme }) => theme.colors.ghost};
`

export const DashboardLayout: React.FunctionComponent = ({ children }) => {
  const { euiTheme } = useEuiTheme()
  return (
    <Wrapper>
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

          <EuiSpacer size="l" />
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
      <Body>
        <Topbar>
          <EuiTitle size="s">
            <h1>Content</h1>
          </EuiTitle>

          <EuiButton fill color="primary">
            Add new product
          </EuiButton>
        </Topbar>

        <Content>{children}</Content>
      </Body>
    </Wrapper>
  )
}
