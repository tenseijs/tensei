import React from 'react'
import Button from 'components/Button'
import Dropdown from 'components/Dropdown'
import { Manager, Reference } from 'react-popper'

class ButtonDropdown extends React.Component {
    state = { isOpen: false }

    _handleButtonOnClick = (e) => {
        e.preventDefault()
        this.setState((s) => ({ isOpen: !s.isOpen }))
    }

    render() {
        const { children, value, dropdownProps, ...buttonProps } = this.props

        const propsForDropdownMenu = dropdownProps
            ? Object.assign(dropdownProps, { show: this.state.isOpen })
            : {
                  show: this.state.isOpen,
              }

        const dropdownMenu = React.createElement(
            Dropdown.Menu,
            propsForDropdownMenu,
            children
        )

        return (
            <Manager>
                <Reference>
                    {({ ref }) => {
                        const propsForButton = Object.assign(
                            {
                                onClick: this._handleButtonOnClick,
                                rootRef: ref,
                                isDropdownToggle: true,
                            },
                            buttonProps
                        )
                        const button = React.createElement(
                            Button,
                            propsForButton,
                            value
                        )
                        return button
                    }}
                </Reference>
                {dropdownMenu}
            </Manager>
        )
    }
}

ButtonDropdown.displayName = 'Button.Dropdown'

export default ButtonDropdown
