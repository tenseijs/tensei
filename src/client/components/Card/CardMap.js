import React from 'react'
import cn from 'classnames'

function CardMap({ className, children, placeholder }) {
    const classes = cn(
        'card-map',
        { 'card-map-placeholder': placeholder },
        className
    )
    return (
        <div
            className={classes}
            style={placeholder && { backgroundImage: `url(${placeholder})` }}
        >
            {children}
        </div>
    )
}

CardMap.displayName = 'Card.Map'

export default CardMap
