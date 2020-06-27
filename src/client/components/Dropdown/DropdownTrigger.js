import React from 'react'
import cn from 'classnames'
import Icon from 'components/Icon'
import Button from 'components/Button'
import { Reference } from 'react-popper'

/**
 * Provides the trigger element for a Dropdown
 */
function DropdownTrigger({
    className,
    toggle = true,
    value,
    children,
    type = 'link',
    icon,
    color,
    isNavLink,
    isOption,
    onClick,
    rootRef,
}) {
    const classes = cn(
        { 'dropdown-toggle': toggle, 'nav-link': isNavLink },
        className
    )

    const childrenFragment = (
        <React.Fragment>
            {icon && (
                <React.Fragment>
                    <Icon name={icon} />{' '}
                </React.Fragment>
            )}
            {value}
            {children}
        </React.Fragment>
    )

    return type === 'link' ? (
        <Reference>
            {({ ref }) => (
                <a className={classes} onClick={onClick} ref={ref}>
                    {childrenFragment}
                </a>
            )}
        </Reference>
    ) : (
        <Reference>
            {({ ref }) => (
                <Button
                    className={classes}
                    color={color}
                    isDropdownToggle
                    isOption={isOption}
                    onClick={onClick}
                    rootRef={ref}
                >
                    {childrenFragment}
                </Button>
            )}
        </Reference>
    )
}

DropdownTrigger.displayName = 'Dropdown.Trigger'

/** @component */
export default DropdownTrigger
