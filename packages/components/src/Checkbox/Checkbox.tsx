import React from 'react'

export interface CheckboxProps {
    id?: string
    name?: string
    label?: string
    checked?: boolean
    className?: string
}

const Checkbox: React.FC<CheckboxProps> = ({
    id,
    name,
    label,
    checked,
    className
}) => {
    const props: any = {
        label,
        id,
        name,
        type: 'checkbox'
    }

    if (checked !== undefined) {
        props.checked = checked
    }

    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={id}
                    className={'text-tensei-darkest inline-block mb-2'}
                >
                    {label}
                </label>
            )}
            <div>
                <input
                    {...props}
                    className="rounded-sm border border-tensei-gray-400"
                />
            </div>
        </div>
    )
}

export default Checkbox
