import React from 'react'
import cn from 'classnames'
import Icon from 'components/Icon'
import Badge from 'components/Badge'

/**
 * An individual item that should be contained within a Dropdown.Menu
 */
function DropdownItem({
    className,
    icon,
    value,
    children,
    badge,
    badgeType,
    to,
    RootComponent,
    onClick,
    useExact,
}) {
    const classes = cn({ 'dropdown-item': true }, className)
    const childrenForAll = (
        <React.Fragment>
            {badge && (
                <span className="float-right">
                    <Badge color={badgeType}>{badge}</Badge>
                </span>
            )}
            {icon && (
                <React.Fragment>
                    <Icon name={icon} className="dropdown-icon" />{' '}
                </React.Fragment>
            )}
            {value}
            {children}
        </React.Fragment>
    )
    return RootComponent ? (
        <RootComponent
            className={classes}
            to={to}
            onClick={onClick}
            exact={useExact}
        >
            {childrenForAll}
        </RootComponent>
    ) : (
        <a className={classes} href={to} onClick={onClick}>
            {childrenForAll}
        </a>
    )
}

DropdownItem.displayName = 'Dropdown.Item'

/** @component */
export default DropdownItem
