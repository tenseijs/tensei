import React from 'react'
import { DetailComponentProps } from '@tensei/components'

export interface BooleanProps extends DetailComponentProps {
    className?: string
}

const BooleanDetail: React.FC<BooleanProps> = ({ value, field }) => {
    const isTrue = value || value === 'true'

    return (
        <div className="flex items-center">
            <div
                className={`w-2 h-2 rounded-full ${
                    isTrue ? 'bg-tensei-success' : 'bg-tensei-error'
                } bg-opacity-80 mr-2`}
            ></div>
            {isTrue ? field.trueLabel : field.falseLabel}
        </div>
    )
}

export default BooleanDetail
