import React, {
    ReactChild,
    Fragment,
    useState,
    ChangeEvent,
    useEffect
} from 'react'

import Pulse from '../Pulse'

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
    loading?: boolean
    rows: TableRow[]
    sort?: {
        field?: string
        direction?: 'asc' | 'desc'
    }
    Empty?: React.ComponentType
    emptyLink?: string
    onSort?: (sort: TableProps['sort']) => void
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
    loading,
    sort: defaultSort = {},
    onSort,
    key = 'id',
    Empty
}) => {
    const [selected, setSelected] = useState<TableRow[]>([])
    const [sort, setSort] = useState<TableProps['sort']>(defaultSort)

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

    useEffect(() => {
        if (onSort) {
            onSort(sort)
        }

        setSelected([])
    }, [sort])

    const Sorter = (
        <svg
            className="ml-2"
            width={10}
            height={14}
            viewBox="0 0 10 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M5 12V1"
                stroke="#21185A"
                strokeWidth="1.5"
                strokeLinecap="square"
            />
            <path
                d="M2 9.3335L5 12.3335L8 9.3335"
                stroke="#21185A"
                strokeWidth="1.5"
                strokeLinecap="square"
            />
        </svg>
    )

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
                <tr className="border-tensei-gray-600">
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
                                disabled={loading}
                                onChange={onSelectAllCheckboxChange}
                                className="text-tensei-primary rounded-sm border border-tensei-gray-500"
                            />
                        </th>
                    ) : null}
                    {columns.map(column => (
                        <th
                            key={column.field}
                            scope="col"
                            className={
                                column.className ||
                                'px-6 py-3 text-left text-xs font-extrabold text-tensei-darkest uppercase tracking-wider'
                            }
                        >
                            <div
                                tabIndex={0}
                                onClick={() =>
                                    column.sorter
                                        ? setSort({
                                              field: column.field,
                                              direction:
                                                  column.field === sort?.field
                                                      ? sort?.direction ===
                                                        'asc'
                                                          ? 'desc'
                                                          : 'asc'
                                                      : 'asc'
                                          })
                                        : undefined
                                }
                                className="flex items-center cursor-pointer focus:outline-none"
                            >
                                {column.title}{' '}
                                {column.sorter ? (
                                    <p
                                        className={`transition duration-150 ease-in-out ${
                                            column.field === sort?.field
                                                ? ''
                                                : 'opacity-30'
                                        } ${
                                            sort?.direction === 'asc' &&
                                            column.field === sort.field
                                                ? 'transform rotate-180 ml-2'
                                                : ''
                                        }`}
                                    >
                                        {Sorter}
                                    </p>
                                ) : null}
                            </div>
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                    <tr className="h-24">
                        <td colSpan={columns.length + 1}>
                            <div className="w-full h-full flex items-center justify-center mt-8">
                                <Pulse dotClassName="bg-tensei-primary" />
                            </div>
                        </td>
                    </tr>
                ) : (
                    <Fragment>
                        {rows.map(row => (
                            <tr key={row[key]}>
                                {selection?.onChange ? (
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                                        <input
                                            type="checkbox"
                                            checked={selected.some(
                                                r => r[key] === row[key]
                                            )}
                                            className="text-tensei-primary rounded-sm border border-tensei-gray-500"
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
                                        <td className="px-6 py-3 whitespace-nowrap text-sm">
                                            {column.render
                                                ? column.render(
                                                      row[column.field],
                                                      row
                                                  )
                                                : row[column.field]}
                                        </td>
                                    </Fragment>
                                ))}
                            </tr>
                        ))}
                        {rows.length === 0 && Empty ? <Empty /> : null}
                    </Fragment>
                )}
            </tbody>
        </table>
    )
}

export default Table
