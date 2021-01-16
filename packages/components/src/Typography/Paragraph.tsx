import React, { EventHandler, SyntheticEvent } from 'react'

export interface ParagraphProps {
    className?: string
    as?: string
    onClick?: EventHandler<SyntheticEvent<HTMLParagraphElement>>
}

const Paragraph: React.FC<ParagraphProps> = ({
    children,
    className,
    onClick,
    as = 'p'
}) => {
    const props: any = {}

    if (onClick) {
        props.tabIndex = 0
    }

    const Component = as

    return (
        <Component
            onClick={onClick}
            className={`text-base ${className}`}
            {...props}
        >
            {children}
        </Component>
    )
}

export default Paragraph
