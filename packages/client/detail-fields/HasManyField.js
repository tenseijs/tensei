import React from 'react'
import { withRouter } from 'react-router-dom'
import { withResources } from '~/store/resources'
import ResourceTable from '~/components/ResourceTable/ResourceTable'

class HasMany extends React.Component {
    state = this.defaultState()

    defaultState() {
        const relatedResource = this.findRelatedResource()

        return {
            page: 1,
            search: '',
            loading: true,
            relatedResource,
            perPage: relatedResource.perPageOptions[0] || 10
        }
    }

    findRelatedResource() {
        return this.props.resources.find(
            relatedResource => relatedResource.name === this.props.field.name
        )
    }

    render() {
        const { relatedResource } = this.state
        const { resourceId, resource } = this.props

        return (
            <ResourceTable
                resource={relatedResource}
                getEndpoint={`resources/${resource.slug}/${resourceId}/${relatedResource.slug}`}
            />
        )
    }
}

export default withRouter(withResources(HasMany))
