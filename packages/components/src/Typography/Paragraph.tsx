import React, { EventHandler, SyntheticEvent } from 'react'

export interface ParagraphProps {
    className?: string
    onClick?: EventHandler<SyntheticEvent<HTMLParagraphElement>>
}

const Paragraph: React.FC<ParagraphProps> = ({
    children,
    className,
    onClick
}) => {
    const props: any = {}

    if (onClick) {
        props.tabIndex = 0
    }

    return (
        <p onClick={onClick} className={`text-base ${className}`} {...props}>
            {children}
        </p>
    )
}

export default Paragraph
