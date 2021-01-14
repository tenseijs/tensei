import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DetailComponentProps, AbstractData, Pulse } from '@tensei/components'

const OneToOne: React.FC<DetailComponentProps> = ({
    detailId,
    resource,
    field
}) => {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<AbstractData | null>(null)

    const relatedResource = window.Tensei.state.resources.find(
        r => r.name === field.name
    )

    if (!relatedResource) {
        return null
    }

    const fetchData = () => {
        setData({})
        setLoading(true)

        window.Tensei.client
            .get(
                `${resource.slug}/${detailId}/${field.inputName}?fields=id,${relatedResource.displayFieldSnakeCase}`
            )
            .then(({ data }) => {
                setData(data.data)
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchData()
    }, [])

    return loading ? (
        <Pulse
            dotClassName="bg-tensei-primary"
            height="10px"
            dotHeight="100%"
        />
    ) : data ? (
        <Link
            to={window.Tensei.getPath(
                `resources/${relatedResource.slug}/${data.id}`
            )}
            className="text-tensei-primary cursor-pointer font-semibold hover:text-tensei-primary-darker transition duration-100 ease-in-out"
        >
            {data[relatedResource.displayFieldSnakeCase]}
        </Link>
    ) : null
}

export default OneToOne
