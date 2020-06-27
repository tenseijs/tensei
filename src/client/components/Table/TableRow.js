import * as React from 'react'
import cn from 'classnames'

function TableRow({ className, children, ...props }) {
    const classes = cn(className)
    return (
        <tr className={classes} {...props}>
            {children}
        </tr>
    )
}

TableRow.displayName = 'Table.Row'

export default TableRow
