import React from 'react'

const Resources = React.createContext({
    resources: [],
})

export const withResources = (Component) => {
    const WithResourcesComponent = (props) => {
        return (
            <Resources.Consumer>
                {(value) => (
                    <Component resources={value.resources} {...props} />
                )}
            </Resources.Consumer>
        )
    }

    return WithResourcesComponent
}

export default Resources
