import React from 'react'
import { Link } from 'react-router-dom'
import {
    TextLink,
    SkeletonText,
    SkeletonContainer,
} from '@contentful/forma-36-react-components'
import { withResources } from '~/store/resources'

class BelongsTo extends React.Component {
    state = {
        loading: !!this.props.value,
        value: '',
    }

    componentDidMount() {
        this.setState(
            {
                relatedResource: this.findRelatedResource(),
            },
            () => this.fetchResource()
        )
    }

    findRelatedResource = () => {
        return this.props.resources.find(
            (relatedResource) => relatedResource.name === this.props.field.name
        )
    }

    fetchResource() {
        const { value } = this.props

        if (!value) {
            return
        }

        const { relatedResource } = this.state

        Tensei.request
            .get(
                `resources/${relatedResource.slug}/${value}?fields=${relatedResource.displayField}`
            )
            .then(({ data }) => {
                this.setState({
                    value: data[relatedResource.displayField],
                    loading: false,
                })
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                })

                Tensei.library.Notification.success(
                    error?.response?.data?.message ||
                        `Could not find a resource with ID ${value}.`
                )
            })
    }

    render() {
        const { value, ...rest } = this.props
        const { loading, value: textValue, relatedResource } = this.state

        return (
            <div className="flex flex-col">
                {loading ? (
                    <SkeletonContainer svgHeight={16}>
                        <SkeletonText numberOfLines={1} />
                    </SkeletonContainer>
                ) : null}
                {!loading && value && textValue ? (
                    <Link
                        to={Tensei.getPath(
                            `resources/${relatedResource.slug}/${value}`
                        )}
                    >
                        <TextLink>{textValue}</TextLink>
                    </Link>
                ) : null}
            </div>
        )
    }
}

export default withResources(BelongsTo)
