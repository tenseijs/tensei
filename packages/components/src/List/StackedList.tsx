import React from 'react'
import { FieldContract } from '../types'

export interface StackListProps {
  fields: FieldContract[]
  values: {
    [key: string]: any
  }
}

const StackedList: React.FC<StackListProps> = ({ fields, values }) => {
  return (
    <div className="bg-white rounded-lg border-tensei-gray-600 border">
      {fields.map((field, index) => (
        <div
          key={field.inputName}
          className={`w-full flex items-center flex-wrap px-6 py-4 ${
            index === 0 ? '' : ' border-t border-tensei-gray-600'
          }`}
        >
          <div className="w-full md:w-1/4 capitalize text-tensei-gray-800">
            {field.name}
          </div>
          <div className="w-full mt-3 md:mt-0 md:w-3/4">
            {values[field.inputName]}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StackedList
