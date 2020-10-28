import React from 'react'

class Text extends React.Component {
    render() {
        const { value, ...rest } = this.props

        return value || ''
    }
}

export default Text
