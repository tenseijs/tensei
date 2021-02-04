import React, { useState } from 'react'
import { DetailComponentProps, Paragraph, Transition } from '@tensei/components'

export interface TextareaProps extends DetailComponentProps {
    className?: string
}

const Textarea: React.FC<TextareaProps> = ({
    value,
    className,
    field,
    children
}) => {
    const [hide, setHide] = useState<boolean>(field.toggleEnabled)

    return (
        <div>
            {field.toggleEnabled ? (
                <button
                    onClick={() => setHide(!hide)}
                    className={`${
                        hide ? '' : 'mb-2'
                    } text-tensei-primary cursor-pointer font-semibold hover:text-tensei-primary-darker transition duration-100 ease-in-out`}
                >
                    {hide ? 'Show' : 'Hide'} content
                </button>
            ) : null}
            {field.toggleEnabled ? (
                <Transition
                    show={!hide}
                    enter="transition-opacity ease-linear duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-linear duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    {children || (
                        <Paragraph className={className}>{value}</Paragraph>
                    )}
                </Transition>
            ) : (
                children || (
                    <Paragraph className={className}>{value}</Paragraph>
                )
            )}
        </div>
    )
}

export default Textarea
