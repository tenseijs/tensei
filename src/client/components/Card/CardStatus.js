import React from 'react'
import cn from 'classnames'

function CardStatus({ className, children, color, side }) {
    const classes = cn(
        {
            'card-status': true,
            [`bg-${color}`]: true,
            [`card-status-left`]: side,
        },
        className
    )
    return <div className={classes}>{children}</div>
}

CardStatus.displayName = 'Card.Status'

export default CardStatus
