import React from 'react'
import {
    TextInput,
    Select,
    Option,
    Button,
    IconButton,
} from '@contentful/forma-36-react-components'

const Filters = ({ fields, operators, filters, addFilter }) => {
    return (
        <div className="w-full px-5 py-6">
            <div className="overflow-scroll" style={{ maxHeight: '300px' }}>
                {filters.map((filter, index) => (
                    <div key={index} className="w-full flex mb-3">
                        <IconButton iconProps={{ icon: 'Delete' }} />
                        <Select width="medium" className="mx-4">
                            {fields.map((field) => (
                                <Option
                                    key={field.inputName}
                                    value={field.inputName}
                                >
                                    {field.name}
                                </Option>
                            ))}
                        </Select>

                        <Select width="medium" className="mr-4">
                            {operators.map((operator) => (
                                <Option key={operator.value}>
                                    {operator.label}
                                </Option>
                            ))}
                        </Select>
                        <TextInput width="medium" className="mr-4" />
                        <IconButton
                            onClick={addFilter}
                            iconProps={{ icon: 'PlusCircle' }}
                        />
                    </div>
                ))}
            </div>

            <div className="w-full justify-end flex pr-8 mt-5">
                <Button buttonType="muted" size="small" className="mr-3">
                    Clear all
                </Button>
                <Button buttonType="positive" size="small">
                    Apply filters
                </Button>
            </div>
        </div>
    )
}

export default Filters
