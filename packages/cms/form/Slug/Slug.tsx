import Dayjs from 'dayjs'
import slugify from 'speakingurl'
import React, { useEffect } from 'react'
import { TextInput, FormComponentProps } from '@tensei/components'

const generateRandomString = () => {
    let length = 5
    let result = ''

    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    const charactersLength = characters.length

    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        )
    }

    return result
}

const shortSlug = generateRandomString()

const Slug: React.FC<FormComponentProps> = ({
    field,
    name,
    id,
    value,
    onChange,
    form,
    error,
    editing
}) => {
    const getSlug = (slug: string) => {
        switch (field.slugType) {
            case 'default':
                return slugify(slug)
            case 'date':
                return slug
                    ? slugify(`${slug} ${Dayjs().format('YYYY-MM-DD')}`)
                    : ''
            case 'random':
                return slug ? slugify(`${slug} ${shortSlug}`) : ''
            default:
                return slugify(slug)
        }
    }

    useEffect(() => {
        if (!editing) {
            onChange(getSlug(form[field.slugFromInputName] as string))
        }
    }, [form[field.slugFromInputName]])

    return (
        <TextInput
            id={id}
            name={name}
            value={value as string}
            label={field.name}
            error={error}
            placeholder={field.name}
            {...{
                ...field.attributes,
                readOnly: !field.slugEditable
            }}
            onChange={event => onChange(event.target.value)}
            inputClassName={
                field.slugEditable ? '' : 'bg-tensei-gray-500 bg-opacity-10'
            }
        />
    )
}

export default Slug
