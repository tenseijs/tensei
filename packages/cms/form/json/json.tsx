import React from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import { IControlledCodeMirror } from 'react-codemirror2'

const FormJson: React.FC<IControlledCodeMirror> = ({
  value,
  options,
  onBeforeChange
}) => {
    return (
      <CodeMirror 
        value={value}
        options={options}
        onBeforeChange={onBeforeChange}
      />
    )
  }
  
  export default FormJson
  