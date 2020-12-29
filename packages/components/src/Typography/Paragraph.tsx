import React from 'react'

export interface ParagraphProps {
    className?: string
}

const Paragraph: React.FC<ParagraphProps> = ({ children, className }) => {
    return <p className={`text-base ${className}`}>{children}</p>
}

export default Paragraph
