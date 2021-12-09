import React from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'

import { FormComponentProps } from '@tensei/components'
import styled from 'styled-components'

import { EuiFieldText } from '@tensei/eui/lib/components/form'

const JsonComponent = styled.div``

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
            mode: 'json'
          }}
          onBeforeChange={(editor, data, value) => {}}
          {...field.attributes}
        />
    )
  }
  
  export default FormJson
  