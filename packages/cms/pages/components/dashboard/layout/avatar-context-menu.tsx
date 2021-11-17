import React, { useState } from 'react'
import styled from 'styled-components'

import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { useGeneratedHtmlId } from '@tensei/eui/lib/services/accessibility'
import { EuiContextMenuItem } from '@tensei/eui/lib/components/context_menu/context_menu_item'
import { EuiContextMenuPanel } from '@tensei/eui/lib/components/context_menu/context_menu_panel'
import { EuiPopover } from '@tensei/eui/lib/components/popover'
import { EuiAvatar } from '@tensei/eui/lib/components/avatar'
import { EuiTextColor } from '@tensei/eui/lib/components/text'
import { useAuthStore } from '../../../../store/auth'

export const AvatarContextMenu: React.FunctionComponent = () => {
  const { logout } = useAuthStore()
  const [isPopoverOpen, setPopover] = useState(false)
  const avatarButtonContextMenuPopoverId = useGeneratedHtmlId({
    prefix: 'avatarButtonContextMenuPopover'
  })

  const onAvatarButtonClick = () => {
    setPopover(!isPopoverOpen)
  }

  const closePopover = () => {
    setPopover(false)
  }

  const onLogoutClick = async () => {
    await logout()
    window.location.href = window.Tensei.getPath('auth/login')
    closePopover()
  }

  const items = [
    <EuiContextMenuItem
      key="settings"
      icon={<EuiIcon type="gear" />}
      onClick={closePopover}
    >
      Settings
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="logout"
      icon={<EuiIcon type="exit" color="danger" />}
      onClick={onLogoutClick}
      color="danger"
    >
      <EuiTextColor color="danger">Logout</EuiTextColor>
    </EuiContextMenuItem>
  ]

  const StyledAvatarButton = styled.button`
    margin-top: 0.75rem;
  `

  const avatarButton = (
    <StyledAvatarButton onClick={onAvatarButtonClick}>
      <EuiAvatar
        name="Kati Frantz"
        imageUrl="https://avatars2.githubusercontent.com/u/19477966?v=4"
      />
    </StyledAvatarButton>
  )

  return (
    <EuiPopover
      id={avatarButtonContextMenuPopoverId}
      button={avatarButton}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="none"
      anchorPosition="leftDown"
    >
      <EuiContextMenuPanel size="s" items={items} />
    </EuiPopover>
  )
}
