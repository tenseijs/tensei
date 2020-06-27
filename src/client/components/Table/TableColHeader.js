// @flow

import * as React from 'react'
import cn from 'classnames'

function TableColHeader({ className, children, colSpan, alignContent = '' }) {
    const classes = cn({ [`text-${alignContent}`]: alignContent }, className)
    return (
        <th className={classes} colSpan={colSpan}>
            {children}
        </th>
    )
}

TableColHeader.displayName = 'Table.ColHeader'

export default TableColHeader
