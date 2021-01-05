import React from 'react'
import { Link } from 'react-router-dom'

import IDDetail from '../../detail/ID'

import { IndexComponentProps } from '@tensei/components'

const ID: React.FC<IndexComponentProps> = ({
    value,
    values,
    field,
    resource
}) => {
    return (
        <Link
            className="cursor-pointer"
            to={window.Tensei.getPath(`resources/${resource.slug}/${value}`)}
        >
            <IDDetail
                value={value}
                field={field}
                values={values}
                resource={resource}
                className="transition duration-150 hover:bg-opacity-20"
            />
        </Link>
    )
}

export default ID
