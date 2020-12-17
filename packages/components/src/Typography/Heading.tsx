import React from 'react'
import cn from 'classnames'

export interface HeadingProps {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    className?: string
}

const Heading: React.FC<HeadingProps> = ({ children, as, className }) => {
    const Element = as!
    return (
        <Element className={cn(className, 'font-bold text-xl tracking-wide')}>
            {children}
        </Element>
    )
}

export default Heading
