import React from 'react'

export interface HeadingProps {
    className?: string
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const Heading: React.FC<HeadingProps> = ({ children, as, className }) => {
    const Element = as || 'h1'

    return (
        <Element
            className={`font-bold text-xl tracking-wide text-tensei-darkest ${className}`}
        >
            {children}
        </Element>
    )
}

export default Heading
