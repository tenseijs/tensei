import * as React from 'react'
import cn from 'classnames'

function TableHeader({ className, children, ...props }) {
    const classes = cn(className)
    return (
        <thead className={classes} {...props}>
            {children}
        </thead>
    )
}

TableHeader.displayName = 'Table.Header'

export default TableHeader
