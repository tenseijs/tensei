import React from 'react'
import cn from 'classnames'
import Icon from 'components/Icon'
import AvatarList from './AvatarList'

/**
 * Renders a single circular avatar
 */
function Avatar({
    className,
    children,
    imageURL,
    style,
    size = '',
    status,
    placeholder,
    icon,
    color = '',
    onClick,
    onMouseEnter,
    onMouseLeave,
    onPointerEnter,
    onPointerLeave,
}) {
    const classes = cn(
        {
            avatar: true,
            [`avatar-${size}`]: !!size,
            'avatar-placeholder': placeholder,
            [`avatar-${color}`]: !!color,
        },
        className
    )
    return (
        <span
            className={classes}
            style={
                imageURL
                    ? Object.assign(
                          {
                              backgroundImage: `url(${imageURL})`,
                          },
                          style
                      )
                    : style
            }
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
        >
            {icon && <Icon name={icon} />}
            {status && <span className={`avatar-status bg-${status}`} />}
            {children}
        </span>
    )
}

Avatar.List = AvatarList

export default Avatar
