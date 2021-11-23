import React, { useState } from 'react'
import styled from 'styled-components'

import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'

const NestedSidebar = styled.div<{ close: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ close }) => (close ? '0' : '260px')};
  height: 100%;
  position: relative;
  border-right: ${({ theme, close }) => (close ? 'none' : theme.border.thin)};
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

const NestedSidebarHeader = styled.div<{ close: boolean }>`
  height: 75px;
  padding: 0 1.75rem;
  display: ${({ close }) => (close ? 'none' : 'flex')};
  align-items: center;
`
const NestedSidebarTitleUnderline = styled.div`
  width: 25%;
  margin: 0 1.75rem;
  ${({ theme }) => `border-bottom: ${theme.border.thin}`}
`

const Group = styled.div<{ close: boolean }>`
  width: 100%;
  display: ${({ close }) => (close ? 'none' : 'flex')};
  flex-direction: column;
`

const NestedSidebarGroupName = styled(EuiText)`
  font-size: 11px;
  font-weight: 500;
  padding: 0rem 1.75rem;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  ${({ theme }) => `color: ${theme.colors.subdued}`}
`
const NavItem = styled.div`
  display: block;
  width: 230px;
  height: 38px;
`

const NavItemWrapper = styled.li<{
  active?: boolean
}>`
  display: flex;
  align-items: center;
  padding: 0.65rem;
  margin-left: 1.5rem;
  margin-right: 1.5rem;
  margin-bottom: 0.3rem;
  list-style: none;
  
  ${({ active, theme }) =>
    active
      ? `
    background-color: ${theme.colors.primaryTransparent};
    color: ${theme.colors.primaryText};
    border-radius: 5px;
    `
      : ``}
`

export const SidebarMenu: React.FunctionComponent = () => {
  const [close, setClose] = useState(false)

  const onCloseSideBar = () => setClose(!close)

  return (
    <NestedSidebar close={close}>
      <CollapseExpandIcon onClick={onCloseSideBar}>
        {close ? (
          <EuiIcon size="s" type="arrowRight" />
        ) : (
          <EuiIcon size="s" type="arrowLeft" />
        )}
      </CollapseExpandIcon>
      <NestedSidebarHeader close={close}>
        <EuiTitle size="s">
          <h1>Content</h1>
        </EuiTitle>
      </NestedSidebarHeader>
      <NestedSidebarTitleUnderline />

      <EuiSpacer size="l" />

      <Group close={close}>
        <NestedSidebarGroupName>Resources</NestedSidebarGroupName>
        <NavItem>
          <NavItemWrapper>
            <EuiText size="xs">Post</EuiText>
          </NavItemWrapper>
        </NavItem>

        <NavItem>
          <NavItemWrapper>
            <EuiText size="xs">Tag</EuiText>
          </NavItemWrapper>
        </NavItem>

        <NavItem>
          <NavItemWrapper>
            <EuiText size="xs">Comment</EuiText>
          </NavItemWrapper>
        </NavItem>
      </Group>
      
      <Group close={close}>
        <NestedSidebarGroupName>Store</NestedSidebarGroupName>
        <NavItem>
          <NavItemWrapper active>
            <EuiText size="xs">Orders</EuiText>
          </NavItemWrapper>
        </NavItem>

        <NavItem>
          <NavItemWrapper>
            <EuiText size="xs">Shipping</EuiText>
          </NavItemWrapper>
        </NavItem>

        <NavItem>
          <NavItemWrapper>
            <EuiText size="xs">Payments</EuiText>
          </NavItemWrapper>
        </NavItem>
      </Group>
    </NestedSidebar>
  )
}
