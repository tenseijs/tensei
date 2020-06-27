import React from 'react'
import cn from 'classnames'
import Icon from 'components/Icon'
import ButtonList from './ButtonList'
import ButtonDropdown from './ButtonDropdown'

const Button = (props) => {
    const {
        size = '',
        outline,
        link,
        block,
        className,
        children,
        disabled,
        color = '',
        square,
        pill,
        icon,
        social = '',
        loading,
        tabIndex,
        isDropdownToggle,
        isOption,
        rootRef,
        to,
        onClick,
        onMouseEnter,
        onMouseLeave,
        onPointerEnter,
        onPointerLeave,
    } = props

    const classes = cn(
        {
            btn: true,
            [`btn-${size}`]: !!size,
            [`btn-block`]: block,
            [`btn-outline-${color}`]: outline && !!color,
            [`btn-link`]: link,
            disabled: disabled,
            [`btn-${color}`]: !!color && !outline,
            [`btn-${social}`]: !!social,
            'btn-square': square,
            'btn-pill': pill,
            'btn-icon': !children,
            'btn-loading': loading,
            'dropdown-toggle': isDropdownToggle,
            'btn-option': isOption,
        },
        className
    )

    const propsForAll = {
        className: classes,
        disabled: disabled,
        onClick: onClick,
        onMouseEnter: onMouseEnter,
        onMouseLeave: onMouseLeave,
        onPointerEnter: onPointerEnter,
        onPointerLeave: onPointerLeave,
        tabIndex: tabIndex,
    }

    const childrenForAll = (
        <React.Fragment>
            {social ? (
                <Icon
                    name={social}
                    prefix="fa"
                    className={children ? 'mr-2' : ''}
                />
            ) : icon ? (
                <Icon name={icon} className={children ? 'mr-2' : ''} />
            ) : null}
            {children}
        </React.Fragment>
    )

    if (!props.RootComponent || props.RootComponent === 'button') {
        const { type, value } = props
        return (
            <button {...propsForAll} type={type} value={value} ref={rootRef}>
                {childrenForAll}
            </button>
        )
    } else if (props.RootComponent === 'input') {
        const { type, value } = props
        return (
            <input {...propsForAll} type={type} value={value} ref={rootRef} />
        )
    } else if (props.RootComponent === 'a') {
        const { href, target } = props
        return (
            <a {...propsForAll} href={href} target={target} ref={rootRef}>
                {childrenForAll}
            </a>
        )
    } else {
        const Component = props.RootComponent
        return (
            <Component {...propsForAll} to={to}>
                {childrenForAll}
            </Component>
        )
    }
}

Button.List = ButtonList
Button.Dropdown = ButtonDropdown

Button.displayName = 'Button'

export default Button
