import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel
} from '@reach/accordion'
import slugify from 'speakingurl'
import React, { useState, useEffect } from 'react'
import {
    Button,
    AbstractData,
    Modal,
    TextInput,
    Textarea,
    Label,
    Checkbox
} from '@tensei/components'

import DeleteModal from '../../components/DeleteModal'

export interface ResourceProps {
    onDelete?: () => void
    onCreate?: () => void
    onUpdate?: () => void
    creating: boolean
    setCreating: (creating: boolean) => void
    deleting: AbstractData | null
    setDeleting: (deleting: any) => void
    editing: AbstractData | null
    setEditing: (editing: AbstractData | null) => void
}

const baseResourcePermissions = [
    {
        label: 'Index',
        value: 'index'
    },
    {
        label: 'Create',
        value: 'insert'
    },
    {
        label: 'Show',
        value: 'show'
    },
    {
        label: 'Update',
        value: 'update'
    },
    {
        label: 'Delete',
        value: 'delete'
    }
]

const ManageUser: React.FC<ResourceProps> = ({
    onDelete,
    onCreate,
    onUpdate,
    creating,
    setCreating,
    deleting,
    setDeleting,
    setEditing,
    editing
}) => {
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState<AbstractData>({
        name: '',
        description: '',
        admin_permissions: []
    })
    const [errors, setErrors] = useState<AbstractData>({})
    const [permissionSlugs, setPermissionSlugs] = useState<string[]>([])
    const [permissions, setPermissions] = useState<AbstractData[]>([])
    const [accordions, setAccordions] = useState<number[]>([])
    const resource = window.Tensei.state.resourcesMap['admin-roles']

    const onSubmit = () => {
        form.admin_permissions = permissionSlugs
            .map(slug => {
                const permission = permissions.find(p => p.slug === slug)

                return permission?.id
            })
            .filter(Boolean)

        form.slug = slugify(form.name)

        setLoading(true)

        window.Tensei.client[editing ? 'patch' : 'post'](
            `${resource.slug}${editing ? `/${editing.id}` : ''}`,
            form
        )
            .then(() => {
                if (onCreate && !editing) {
                    onCreate()
                }

                if (onUpdate && editing) {
                    onUpdate()
                }

                window.Tensei.success(
                    `Admin role ${editing ? 'updated' : 'created'}.`
                )

                if (editing) {
                    setEditing(null)
                } else {
                    setCreating(false)
                }

                setLoading(false)
            })
            .catch(error => {
                let validationErrors: AbstractData = {}

                if (
                    error.response.status === 422 &&
                    error?.response?.data?.errors
                ) {
                    error?.response?.data?.errors.forEach((error: any) => {
                        validationErrors[error.field] = error.message
                    })

                    setErrors(validationErrors)
                }

                setLoading(false)
                window.Tensei.error(
                    `Failed ${editing ? 'updating' : 'creating'} admin role.`
                )
            })
    }

    useEffect(() => {
        if (editing) {
            setForm({
                name: editing.name,
                description: editing.description
            })
            setPermissionSlugs(
                editing.admin_permissions.map((p: any) => p.slug)
            )
        }
    }, [editing])

    useEffect(() => {
        window.Tensei.client.get('admin-permissions').then(({ data }) => {
            setPermissions(data.data)
        })
    }, [])

    const onCheckboxSelected = (permissionSlug: string, checked: boolean) => {
        if (permissionSlugs.includes(permissionSlug)) {
            setPermissionSlugs(
                permissionSlugs.filter(p => p !== permissionSlug)
            )
        } else {
            setPermissionSlugs([...permissionSlugs, permissionSlug])
        }
    }

    const resources = window.Tensei.state.resources

    return (
        <>
            <DeleteModal
                open={!!deleting}
                resource={resource}
                setOpen={() => setDeleting(null)}
                selected={[deleting!].filter(Boolean)}
                onDelete={() => (onDelete ? onDelete() : undefined)}
            />
            <Modal
                noPadding
                className="align-top sm:my-32 sm:max-w-4xl"
                title={`${editing ? 'Update' : 'Add'} ${resource.name}`}
                open={creating || Boolean(editing)}
                setOpen={
                    Boolean(editing) ? () => setEditing(null) : setCreating
                }
            >
                <div className="py-6">
                    <div className="mb-5">
                        <TextInput
                            value={form.name}
                            label="Name"
                            name="name"
                            id="name"
                            placeholder="Name"
                            error={errors.name as string}
                            onChange={event =>
                                setForm({
                                    ...form,
                                    name: event.target.value
                                })
                            }
                        />
                    </div>
                    <div className="mb-5">
                        <Textarea
                            label="Description"
                            name="description"
                            id="description"
                            placeholder="Description"
                            value={form.description}
                            error={errors.description as string}
                            onChange={event =>
                                setForm({
                                    ...form,
                                    description: event.target.value
                                })
                            }
                        />
                    </div>
                    <div className="mb-8">
                        <Label label="Select Permissions" id="permissions" />

                        <Accordion
                            index={accordions}
                            onChange={toggleIndex => {
                                if (toggleIndex === undefined) {
                                    return
                                }

                                if (accordions.includes(toggleIndex)) {
                                    setAccordions(
                                        accordions.filter(
                                            a => a !== toggleIndex
                                        )
                                    )
                                } else {
                                    setAccordions(
                                        [...accordions, toggleIndex].sort()
                                    )
                                }
                            }}
                        >
                            {resources.map((r, index) => {
                                const currentSlugs = baseResourcePermissions.map(
                                    p => `${p.value}:${r.slug}`
                                )

                                const newSlugs = permissionSlugs.filter(
                                    s => !currentSlugs.includes(s)
                                )

                                return (
                                    <AccordionItem key={r.slug}>
                                        <AccordionButton
                                            className={`permissions-accordion-button w-full focus:outline-none font-semibold text-tensei-darkest mb-1 focus:ring-2 focus:ring-offset-2 focus:ring-tensei-primary transition ease-in-out`}
                                        >
                                            <div
                                                className={`w-full px-5 py-3 bg-tensei-gray-300 flex items-center justify-between`}
                                            >
                                                <Checkbox
                                                    labelClassName="font-bold"
                                                    checked={
                                                        currentSlugs.filter(s =>
                                                            permissionSlugs.includes(
                                                                s
                                                            )
                                                        ).length ===
                                                        currentSlugs.length
                                                    }
                                                    onClick={event =>
                                                        event.stopPropagation()
                                                    }
                                                    reverse
                                                    disabled={
                                                        editing
                                                            ? editing.slug ===
                                                              'super-admin'
                                                            : undefined
                                                    }
                                                    className="flex"
                                                    label={r.label}
                                                    checkboxClassName="mr-4"
                                                    id={r.slug}
                                                    name={r.slug}
                                                    onChange={event => {
                                                        if (
                                                            event.target.checked
                                                        ) {
                                                            setPermissionSlugs([
                                                                ...newSlugs,
                                                                ...currentSlugs
                                                            ])
                                                        } else {
                                                            setPermissionSlugs(
                                                                newSlugs
                                                            )
                                                        }
                                                    }}
                                                />

                                                <svg
                                                    width={12}
                                                    height={12}
                                                    viewBox="0 0 12 9"
                                                    className={`fill-current transition ease-in-out ${
                                                        accordions.includes(
                                                            index
                                                        )
                                                            ? 'transform rotate-180'
                                                            : ''
                                                    }`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M1.41 0.840027L6 5.42003L10.59 0.840027L12 2.25003L6 8.25003L0 2.25003L1.41 0.840027Z" />
                                                </svg>
                                            </div>
                                        </AccordionButton>
                                        <AccordionPanel
                                            className={`focus:outline-none px-5 transition ease-in-out permissions-accordion-panel`}
                                        >
                                            <div className="flex flex-wrap w-full py-4 pl-6">
                                                {baseResourcePermissions.map(
                                                    (
                                                        permissionType,
                                                        permissionIndex
                                                    ) => {
                                                        return (
                                                            <Checkbox
                                                                checked={permissionSlugs.includes(
                                                                    `${permissionType.value}:${r.slug}`
                                                                )}
                                                                key={
                                                                    permissionType.value
                                                                }
                                                                onChange={event =>
                                                                    onCheckboxSelected(
                                                                        `${permissionType.value}:${r.slug}`,
                                                                        event
                                                                            .target
                                                                            .checked
                                                                    )
                                                                }
                                                                reverse
                                                                disabled={
                                                                    editing
                                                                        ? editing.slug ===
                                                                          'super-admin'
                                                                        : undefined
                                                                }
                                                                label={
                                                                    permissionType.label
                                                                }
                                                                id={`${permissionType.value}:${r.slug}`}
                                                                className={`w-1/4 flex ${
                                                                    permissionIndex >
                                                                    3
                                                                        ? 'mt-4'
                                                                        : ''
                                                                }`}
                                                                checkboxClassName={
                                                                    'mb-1 mr-4'
                                                                }
                                                            />
                                                        )
                                                    }
                                                )}
                                            </div>
                                        </AccordionPanel>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </div>
                    <div className="flex justify-end mb-2">
                        <Button
                            onClick={() => {
                                setCreating(false)
                                setEditing(null)
                            }}
                            clear
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onSubmit}
                            loading={loading}
                            className="ml-3"
                            success
                        >
                            {editing ? 'Update' : 'Create Role'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default ManageUser
