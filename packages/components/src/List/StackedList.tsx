import React from 'react'
import cn from 'classnames'

export interface StackListProps {
    fields: any
}

const StackedList: React.FC<StackListProps> = ({ fields }) => {
    return (
        <>
            {fields.map((field: any, index: any) => (
                <div
                    key={field.inputName}
                    className={cn(
                        'w-full flex items-center flex-wrap px-6 py-4',
                        {
                            'border-t border-tensei-gray-300': index !== 0
                        }
                    )}
                >
                    <div className="w-1/4 capitalize text-tensei-gray-700">
                        some text
                    </div>
                    <div className="w-3/4">some more text</div>
                </div>
            ))}
        </>
    )
}

export default StackedList
