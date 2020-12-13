import React from 'react'
import cn from 'classnames'

export interface ParagraphProps {
    className?: string
}

const Paragraph: React.FC<ParagraphProps> = ({ children, className }) => {
    return <p className={cn(className, 'text-base')}>{children}</p>
}

export default Paragraph
