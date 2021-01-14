import React from 'react'
import { DetailComponentProps, Paragraph } from '@tensei/components'

import TextDetail from '../../detail/Text'

export interface TextProps extends DetailComponentProps {
    className?: string
    truncate?: boolean
}

const Text: React.FC<TextProps> = ({ ...all }) => (
    <TextDetail truncate={all.truncate === undefined ? true : false} {...all} />
)

export default Text
