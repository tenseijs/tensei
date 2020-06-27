import React from 'react'
import cn from 'classnames'

/**
 * A small colored rectangle with rounded corners.
 */
function Badge({ className, children, color = 'primary' }) {
    const classes = cn(
        {
            badge: true,
            [`badge-${color}`]: color,
        },
        className
    )
    return <span className={classes}>{children}</span>
}

export default Badge
