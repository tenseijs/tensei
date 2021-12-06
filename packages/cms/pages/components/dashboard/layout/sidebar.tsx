import { Link } from 'react-router-dom'
import React, { useState } from 'react'
import styled from 'styled-components'

import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'

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

const NavItem = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  svg {
    margin-right: 10px;
  }

  div {
    font-weight: 500;
  }
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

const SubNavItem = styled(Link)`
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  padding-left: 32px;
  border-radius: 2px;
  transition: all 0.25s ease-in-out;

  color: ${({ theme }) => theme.colors.text};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primaryTransparent};
  }
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
        fill="#282828"
      />
    </svg>
  )
}

export const SidebarMenu: React.FunctionComponent<SidebarProps> = ({
  children,
  title,
  groups
}) => {
  const [close, setClose] = useState(false)

  const onCloseSideBar = () => setClose(!close)

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

            <EuiText>Resources</EuiText>
            <ResourcesCountBadge>4</ResourcesCountBadge>
          </NavItem>

          <EuiSpacer size="xs" />

          <SubNavItem to={'/cms/resources/products'}>Product</SubNavItem>
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
