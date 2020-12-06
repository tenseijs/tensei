import React, {
    ReactChild,
    Fragment,
    useState,
    ChangeEvent,
    useEffect
} from 'react'

export interface TableColumn {
    title: ReactChild
    field: string
    sorter?: boolean
    className?: string
    render?: (value: string | number, row: TableRow) => ReactChild
}

export interface TableRow {
    [key: string]: string | number
}

export interface TableCheckboxProps {
    name: string
    disabled: boolean
}

export interface TableProps {
    key?: string
    rows: TableRow[]
    columns: TableColumn[]
    selection?: {
        onChange: (keys: (string | number)[], rows: TableRow[]) => any
        getCheckboxProps?: (row: TableRow) => TableCheckboxProps
    }
}

const Table: React.FC<TableProps> = ({
    columns,
    selection,
    rows,
    key = 'id'
}) => {
    const [selected, setSelected] = useState<TableRow[]>([])

    const onCheckboxChange = (
        row: TableRow,
        event: ChangeEvent<HTMLInputElement>
    ) => {
        if (event.target.checked) {
            setSelected([...selected, row])
        } else {
            setSelected(selected.filter(s => s[key] !== row[key]))
        }
    }

    const onSelectAllCheckboxChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        if (event.target.checked) {
            setSelected(rows.map(row => row))
        } else {
            setSelected([])
        }
    }

    useEffect(() => {
        if (selection?.onChange) {
            selection?.onChange(
                selected.map(s => s[key]),
                selected
            )
        }
    }, [selected])

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
                <tr>
                    {selection?.onChange ? (
                        <th
                            key="select-all"
                            className="px-6 py-3 text-left text-xs font-medium text-tensei-darkest uppercase tracking-wider"
                        >
                            <input
                                type="checkbox"
                                checked={
                                    selected.length !== 0 &&
                                    selected.length === rows.length
                                }
                                onChange={onSelectAllCheckboxChange}
                                className="text-tensei-primary"
                            />
                        </th>
                    ) : null}
                    {columns.map(column => (
                        <th
                            key={column.field}
                            scope="col"
                            className={
                                column.className ||
                                'px-6 py-3 text-left text-xs font-medium text-tensei-darkest uppercase tracking-wider'
                            }
                        >
                            {column.title}
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
                {rows.map(row => (
                    <tr key={row[key]}>
                        {selection?.onChange ? (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={selected.some(
                                        r => r[key] === row[key]
                                    )}
                                    className="text-tensei-primary"
                                    onChange={event =>
                                        onCheckboxChange(row, event)
                                    }
                                />
                            </td>
                        ) : null}
                        {columns.map((column, index) => (
                            <Fragment
                                key={`${column.field}-${row[key]}-${index}`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {column.render
                                        ? column.render(row[column.field], row)
                                        : row[column.field]}
                                </td>
                            </Fragment>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default Table
