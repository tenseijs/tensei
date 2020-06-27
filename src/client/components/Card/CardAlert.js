import React from 'react'
import cn from 'classnames'

function CardAlert({ className, children, color }) {
    const classes = cn(`card-alert alert alert-${color} mb-0`, className)
    return <div className={classes}>{children}</div>
}

CardAlert.displayName = 'Card.Alert'

export default CardAlert
