import React from 'react'
import { FormComponentProps } from '@tensei/components'
import { EuiTextArea, EuiFormRow } from '@tensei/eui/lib/components/form'
import { EuiAccordion } from '@tensei/eui/lib/components/accordion'
import { useGeneratedHtmlId } from '@tensei/eui/lib/services'

const FormTextarea: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  value,
  onChange,
  error
}) => {
  const rightArrowAccordionId = useGeneratedHtmlId({
    prefix: 'rightArrowAccordion'
  })

  return (
    <EuiAccordion
      id={rightArrowAccordionId}
      arrowDisplay="right"
      buttonContent="This accordion has the arrow on the right"
    >
      <EuiFormRow label={field.name} error={error} isInvalid={!!error}>
        <EuiTextArea
          id={id}
          name={name}
          fullWidth
          value={value}
          isInvalid={!!error}
          onChange={event => onChange(event.target.value)}
          placeholder={field.name}
          {...field.attributes}
        />
      </EuiFormRow>
    </EuiAccordion>
  )
}

export default FormTextarea
