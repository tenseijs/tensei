import React from 'react'
import cn from 'classnames'

/**
 * Renders a group of Icons
 */
function AvatarList({ className, children, stacked }) {
    const classes = cn(
        {
            'avatar-list': true,
            'avatar-list-stacked': stacked,
        },
        className
    )
    return <div className={classes}>{children}</div>
}

AvatarList.displayName = 'Avatar.List'

export default AvatarList
