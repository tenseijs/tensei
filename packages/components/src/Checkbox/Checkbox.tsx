import React, { ChangeEventHandler, MouseEvent } from 'react'

export interface CheckboxProps {
    id?: string
    name?: string
    error?: string
    label?: string
    checked?: boolean
    reverse?: boolean
    className?: string
    disabled?: boolean
    labelClassName?: string
    checkboxClassName?: string
    onClick?: (event: MouseEvent<HTMLDivElement>) => void
    onChange?: ChangeEventHandler<HTMLInputElement>
}

const Checkbox: React.FC<CheckboxProps> = ({
    id,
    name,
    label,
    error,
    checked,
    className,
    onChange,
    reverse,
    onClick,
    disabled,
    labelClassName,
    checkboxClassName
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

    const renderLabel = label && (
        <label
            htmlFor={id}
            className={`font-semibold text-tensei-darkest block ${
                reverse ? '' : 'mb-2'
            } ${labelClassName || ''}`}
        >
            {label}
        </label>
    )

    const renderCheckbox = (
        <div>
            <input
                {...props}
                disabled={disabled}
                className={`rounded-sm border border-tensei-gray-500 ${checkboxClassName ||
                    ''} ${disabled ? 'opacity-80 cursor-not-allowed' : ''}`}
            />

            {error ? (
                <i className="text-tensei-error inline-block mt-2 text-sm">
                    {error}
                </i>
            ) : null}
        </div>
    )

    return (
        <div onClick={onClick} className={className}>
            {reverse ? (
                <>
                    {renderCheckbox}
                    {renderLabel}
                </>
            ) : (
                <>
                    {renderLabel}
                    {renderCheckbox}
                </>
            )}
        </div>
    )
}

export default Checkbox
