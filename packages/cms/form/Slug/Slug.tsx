import React from 'react'
import { FormComponentProps } from '@tensei/components'
import { EuiFieldText } from '@tensei/eui/lib/components/form'
import Dayjs from 'dayjs'
import slugify from 'speakingurl'

const generateRandomString = () => {
  let length = 5
  let result = ''

  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  const charactersLength = characters.length

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

const FormSlug: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  onChange,
  form,
  error
}) => {
  const getSlug = (slug: string) => {
    const shortSlug = generateRandomString()

    switch (field.slugType) {
      case 'default':
        return slugify(slug)
      case 'date':
        return slug ? slugify(`${slug} ${Dayjs().format('YYYY-MM-DD')}`) : ''
      case 'random':
        return slug ? slugify(`${slug} ${shortSlug}`) : ''
      default:
        return slugify(slug)
    }
  }

  return (
    <EuiFieldText
      id={id}
      name={name}
      fullWidth
      value={form[field.inputName] || field.slugFromInputName}
      isInvalid={!!error}
      onBlur={event => onChange(getSlug(event.target.value))}
      onChange={event => onChange(event.target.value)}
      placeholder={field.name}
      {...field.attributes}
    />
  )
}

export default FormSlug
