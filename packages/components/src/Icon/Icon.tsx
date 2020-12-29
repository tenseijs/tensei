import React from 'react'

import Set, { SupportedIcons } from './set'

interface IconProps {
    fill?: string
    width?: number
    height?: number
    active?: boolean
    className?: string
    activeFill?: string
    icon: SupportedIcons
}

const Icon: React.FC<IconProps> = ({
    fill = '#525692',
    activeFill = '#2346F8',
    icon,
    width = 16,
    height = 16,
    active = false
}) => {
    const el = Set({
        fill,
        width,
        height,
        active,
        activeFill
    })[icon]

    return el || null
}

export default Icon
