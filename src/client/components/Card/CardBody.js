import React from 'react'
import cn from 'classnames'

function CardBody({ className, children }) {
    const classes = cn('card-body', className)
    return <div className={classes}>{children}</div>
}

CardBody.displayName = 'Card.Body'

export default CardBody
