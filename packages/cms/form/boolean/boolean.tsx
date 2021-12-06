import React, { useState, useEffect } from 'react'
import { FormComponentProps } from '@tensei/components'
import { EuiRadioGroup } from '@tensei/eui/lib/components/form'
import { useGeneratedHtmlId } from '@tensei/eui/lib/services'
import styled from 'styled-components'

const BooleanComponent = styled.div`
  width: 100%;
`

const FormBoolean: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  value,
  onChange,
  onFocus
}) => {
  const booleanOptionTrue = useGeneratedHtmlId({
    prefix: 'booleanOption',
    suffix: 'true'
  })
  const booleanOptionFalse = useGeneratedHtmlId({
    prefix: 'booleanOption',
    suffix: 'false'
  })

  const [booleanOption, setBooleanOption] = useState(booleanOptionFalse)
  const booleanOptions = [
    {
      id: booleanOptionTrue,
      label: field.trueLabel
    },
    {
      id: booleanOptionFalse,
      label: field.falseLabel
    }
  ]

  useEffect(() => {
    if (value == true) setBooleanOption(booleanOptionTrue)
    else setBooleanOption(booleanOptionFalse)
  })

  const onOptionChange = (optionId: any) => {
    setBooleanOption(optionId)
    return optionId == booleanOptionTrue
  }

  return (
    <BooleanComponent>
      <EuiRadioGroup
        id={id}
        name={name}
        onFocus={onFocus}
        options={booleanOptions}
        idSelected={booleanOption}
        onChange={id => onChange(onOptionChange(id))}
        placeholder={field.name}
        {...field.attributes}
      />
    </BooleanComponent>
  )
}

export default FormBoolean
