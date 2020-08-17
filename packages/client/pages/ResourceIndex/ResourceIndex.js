import React from 'react'

import { withResources } from '~/store/resources'
import { debounce } from 'throttle-debounce'
import ResourceTable from '~/components/ResourceTable/ResourceTable'

class ResourceIndex extends React.Component {
    state = this.defaultState()

    defaultState() {
        const resource = this.findResource()

        return {
            resource,
        }
    }

    pushParamsToUrl = () => {
        this.props.history.push(
            `${this.props.location.pathname}?page=${this.state.page}&per_page=${this.state.perPage}&search=${this.state.search}`
        )
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.match.params.resource !== this.props.match.params.resource
        ) {
            this.bootComponent()
        }
    }

    bootComponent = () => {
        this.setState(this.defaultState())
    }

    findResource() {
        return this.props.resources.find(
            (resource) => resource.slug === this.props.match.params.resource
        )
    }

    render() {
        return <ResourceTable resource={this.state.resource} />
    }
}

export default withResources(ResourceIndex)
