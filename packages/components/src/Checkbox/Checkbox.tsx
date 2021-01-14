import React, { ChangeEventHandler } from 'react'

export interface CheckboxProps {
    id?: string
    name?: string
    error?: string
    label?: string
    checked?: boolean
    className?: string
    onChange?: ChangeEventHandler<HTMLInputElement>
}

const Checkbox: React.FC<CheckboxProps> = ({
    id,
    name,
    label,
    error,
    checked,
    className,
    onChange
}) => {
    const props: any = {
        label,
        id,
        name,
        type: 'checkbox',
        onChange
    }

    if (checked !== undefined) {
        props.checked = checked
    }

    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={id}
                    className={'font-semibold text-tensei-darkest block mb-2'}
                >
                    {label}
                </label>
            )}
            <div>
                <input
                    {...props}
                    className="rounded-sm border border-tensei-gray-500"
                />

                {error ? (
                    <i className="text-tensei-error inline-block mt-2 text-sm">
                        {error}
                    </i>
                ) : null}
            </div>
        </div>
    )
}

export default Checkbox
