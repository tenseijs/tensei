import React from 'react'
import * as Icons from '@tensei/react-icons'

interface IconProps {
    fill?: string
    width?: number
    height?: number
    active?: boolean
    className?: string
    activeFill?: string
    icon: string
}

function toPascalCase(iconName: string) {
    return iconName
        .replace(new RegExp(/[-_]+/, 'g'), ' ')
        .replace(new RegExp(/[^\w\s]/, 'g'), '')
        .replace(
            new RegExp(/\s+(.)(\w+)/, 'g'),
            // @ts-ignore
            ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
        )
        .replace(new RegExp(/\s/, 'g'), '')
        .replace(new RegExp(/\w/), s => s.toUpperCase())
}

const Icon: React.FC<IconProps> = ({
    fill = '#525692',
    activeFill = '#2346F8',
    icon,
    width = 28,
    height = 28,
    active = false
}) => {
    const iconName = `${toPascalCase(icon)}Icon`

    const Icon =
        (Icons as any)[iconName] ||
        (Icons as any)[`${icon}Icon`] ||
        (Icons as any)[icon]

    if (!Icon) {
        return null
    }

    return (
        <Icon
            width={width}
            height={height}
            color={active ? activeFill : fill}
        />
    )
}

export default Icon
