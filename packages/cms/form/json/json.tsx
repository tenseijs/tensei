import React from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'

import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'


import { FormComponentProps } from '@tensei/components'

const FormJson: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  value,
  onChange,
  onFocus,
  error
}) => {
    return (
      <CodeMirror
          value={value}
          options={{
            mode: {name: "javascript", json: true},
            lineWrapping: true,
            lint: true,
            lineNumbers: true,
          }}
          onBeforeChange={(editor, data, value) => {
            onChange(value)
          }}
          onChange={(editor, value) => {
            console.log('controlled', {value});
          }}
          onFocus={onFocus}
          {...field.attributes}
        />
    )
  }
  
  export default FormJson
  