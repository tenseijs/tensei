import React from 'react'

/**
 * A helper to help you do something when a user clicks outside of a component
 */
class ClickOutside extends React.PureComponent {
    elementRef

    componentDidMount = () => {
        document.addEventListener('mousedown', this.handleOutsideOnClick, false)
    }

    componentWillUnmount = () => {
        document.removeEventListener(
            'mousedown',
            this.handleOutsideOnClick,
            false
        )
    }

    setElementRef = (el) => {
        if (el) this.elementRef = el
    }

    isOutsideClick = (target) =>
        this.elementRef &&
        target instanceof Node &&
        !this.elementRef.contains(target)

    handleOutsideOnClick = ({ target }) => {
        if (this.isOutsideClick(target)) this.props.onOutsideClick()
    }

    render() {
        const { children } = this.props
        return children({ setElementRef: this.setElementRef })
    }
}

export default ClickOutside
