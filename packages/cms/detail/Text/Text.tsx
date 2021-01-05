import React from 'react'
import { DetailComponentProps, Paragraph } from '@tensei/components'

export interface TextProps extends DetailComponentProps {
    className?: string
}

const Text: React.FC<TextProps> = ({ value, className }) => (
    <Paragraph className={className}>{value}</Paragraph>
)

export default Text
