import React from 'react'

class Link extends React.Component {
    render() {
        const { value, ...rest } = this.props

        return (
            <a href={value} target="_blank">
                View
            </a>
        )
    }
}

export default Link
