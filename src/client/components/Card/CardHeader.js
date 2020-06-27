import React from 'react'
import cn from 'classnames'

function CardHeader({ className, children, backgroundURL = '' }) {
    const classes = cn('card-header', className)

    return (
        <div
            className={classes}
            style={
                backgroundURL
                    ? Object.assign({
                          backgroundImage: `url(${backgroundURL})`,
                      })
                    : null
            }
        >
            {children}
        </div>
    )
}

CardHeader.displayName = 'Card.Header'

export default CardHeader
