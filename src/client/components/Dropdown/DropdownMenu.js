import React from 'react'
import cn from 'classnames'
import { Popper } from 'react-popper'

/**
 * The wrapper element for a Dropdowns Items
 */
function DropdownMenu({
    className,
    children,
    position = 'bottom',
    arrow,
    arrowPosition = 'left',
    style,
    rootRef,
    show = false,
}) {
    const classes = cn(
        {
            'dropdown-menu': true,
            [`dropdown-menu-${arrowPosition}`]: arrowPosition,
            [`dropdown-menu-arrow`]: arrow,
            show: show,
        },
        className
    )
    return (
        show && (
            <Popper
                placement={position}
                eventsEnabled={true}
                positionFixed={false}
            >
                {({ ref, style, placement }) => {
                    return (
                        <div
                            className={classes}
                            data-placement={placement}
                            style={style}
                            ref={ref}
                        >
                            {children}
                        </div>
                    )
                }}
            </Popper>
        )
    )
}

DropdownMenu.displayName = 'Dropdown.Menu'

export default DropdownMenu
