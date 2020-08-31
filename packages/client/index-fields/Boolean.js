import React from 'react'
import cn from 'classnames'

class BooleanField extends React.Component {
    render() {
        const { value, field, ...rest } = this.props

        let checked = false

        if ([1, true, 'true'].includes(value)) {
            checked = true
        }

        return (
            <div className="flex items-center">
                <div className={cn('h-2 w-2 mr-2 rounded-full', {
                    'bg-green-500': checked,
                    'bg-red-500': ! checked
                })}></div>
                {checked ? field.trueLabel : field.falseLabel}
            </div>
        )
    }
}

export default BooleanField
