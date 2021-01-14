import React, { useState, useEffect } from 'react'
import { Heading, Button, AbstractData } from '@tensei/components'

import { Pulse } from '@tensei/components'
import PageWrapper from '../../components/PageWrapper'
import { useParams, Redirect, Link, useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'

interface CreateResourceProps {}

const CreateResource: React.FC<CreateResourceProps> = ({}) => {
    const params = useParams<{
        resource: string
        id: string
    }>()
    const [errors, setErrors] = useState<AbstractData>({})
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<AbstractData>({})
    const [booted, setBooted] = useState(false)
    const history = useHistory()

    const resource = window.Tensei.state.resourcesMap[params.resource]

    if (!resource) {
        return <Redirect to={window.Tensei.getPath('404')} />
    }

    const creationFields = resource.fields.filter(field => field.showOnCreation)

    const sidebarFields = creationFields.filter(field => field.sidebar)
    const mainbarFields = creationFields.filter(field => !field.sidebar)

    const sidebarVisible = sidebarFields.length > 0

    const isEditing = !!params.id

    const onErrorCatch = (error: AxiosError) => {
        window.Tensei.error(`Failed saving ${resource.name.toLowerCase()}.`)

        if (error?.response?.status === 422) {
            let errors: AbstractData = {}

            error?.response?.data?.errors.forEach((error: any) => {
                errors[error.field] = error.message
            })

            setErrors(errors)
        }

        setSaving(false)
    }

    const onSave = () => {
        setSaving(true)

        window.Tensei.client[isEditing ? 'patch' : 'post'](
            `/${resource.slug}/${isEditing ? params.id : ''}`,
            form
        )
            .then(() => {
                window.Tensei.success(
                    `${resource.name} ${isEditing ? 'updated' : 'created'}.`
                )

                history.push(
                    window.Tensei.getPath(`resources/${resource.slug}`)
                )
            })
            .catch(onErrorCatch)
    }

    const setDefaultFormData = () => {
        if (!isEditing) {
            let formData: AbstractData = {}

            creationFields.forEach(field => {
                formData[field.inputName] = field.defaultValue
            })

            setForm(formData)
            setBooted(true)

            return
        }

        window.Tensei.client
            .get(`${resource.slug}/${params.id}`)
            .then(({ data }) => {
                let formData: AbstractData = {}

                creationFields.forEach(field => {
                    formData[field.inputName] =
                        data.data[field.inputName] || field.defaultValue
                })

                setForm(formData)
                setBooted(true)
            })
            .catch(() => {
                window.Tensei.error(
                    `${resource.name} with ID ${params.id} not found.`
                )
            })
    }

    useEffect(() => {
        setDefaultFormData()
    }, [])

    const ActionButtons = (
        <div className="flex mt-4 md:mt-0">
            <Link to={window.Tensei.getPath(`resources/${resource.slug}`)}>
                <Button clear>Cancel</Button>
            </Link>
            <Button onClick={onSave} primary loading={saving} className="ml-5">
                Save
            </Button>
        </div>
    )

    return (
        <PageWrapper>
            <header className="flex flex-wrap items-center justify-between">
                <Heading className="w-full md:w-auto" as="h1">
                    {isEditing ? 'Update' : 'Create'} {resource.name}
                </Heading>

                {ActionButtons}
            </header>
            {booted ? (
                <div className="flex flex-wrap md:flex-nowrap mt-6">
                    <div
                        className={`flex flex-col flex-wrap w-full ${
                            sidebarVisible ? 'md:w-4/6' : ''
                        } bg-white border border-tensei-gray-600 rounded-lg p-8 md:mr-8`}
                    >
                        {mainbarFields.map(field => {
                            const Component =
                                window.Tensei.components.form[
                                    field.component.form
                                ] || window.Tensei.components.form.Text

                            return (
                                <div
                                    key={field.inputName}
                                    className={`mb-5 ${
                                        sidebarVisible ? 'w-full' : 'w-3/5'
                                    }`}
                                >
                                    <Component
                                        form={form}
                                        field={field}
                                        resource={resource}
                                        id={field.inputName}
                                        editing={isEditing}
                                        editingId={params.id}
                                        name={field.inputName}
                                        error={errors[field.inputName]}
                                        value={form[field.inputName]}
                                        onChange={(value: any) => {
                                            setForm({
                                                ...form,
                                                [field.inputName]: value
                                            })

                                            setErrors({
                                                ...errors,
                                                [field.inputName]: undefined
                                            })
                                        }}
                                    />
                                </div>
                            )
                        })}
                    </div>
                    {sidebarVisible ? (
                        <div className="w-full md:w-2/6 mt-5 md:mt-0">
                            {sidebarFields.map((field, index) => {
                                const Component =
                                    window.Tensei.components.form[
                                        field.component.form
                                    ] || window.Tensei.components.form.Text

                                return (
                                    <div
                                        key={field.inputName}
                                        className={`bg-white border border-tensei-gray-600 rounded-lg p-8 ${
                                            index === sidebarFields.length - 1
                                                ? ''
                                                : 'mb-8'
                                        }`}
                                    >
                                        <Component
                                            form={form}
                                            field={field}
                                            editing={isEditing}
                                            resource={resource}
                                            editingId={params.id}
                                            id={field.inputName}
                                            name={field.inputName}
                                            error={errors[field.inputName]}
                                            value={form[field.inputName]}
                                            onChange={(value: any) => {
                                                setForm({
                                                    ...form,
                                                    [field.inputName]: value
                                                })

                                                setErrors({
                                                    ...errors,
                                                    [field.inputName]: undefined
                                                })
                                            }}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="w-full flex justify-center py-12">
                    <Pulse dotClassName="bg-tensei-primary" />
                </div>
            )}

            <div className="md:hidden">{ActionButtons}</div>
        </PageWrapper>
    )
}

export default CreateResource
