import Qs from 'qs'
import Paginate from 'react-paginate'
import { throttle } from 'throttle-debounce'
import React, { useState, useCallback, useEffect } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import {
    Button,
    AbstractData,
    Modal,
    TextInput,
    Checkbox,
    DeleteModal
} from '@tensei/components'

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
    const [form, setForm] = useState<AbstractData>({})
    const [errors, setErrors] = useState<AbstractData>({})
    const resource = window.Tensei.state.resourcesMap['admin-users']

    const onSubmit = () => {
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
                    editing
                        ? 'Admin user updated.'
                        : `Admin user created. The new admin may now login.`
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
                    `Failed ${editing ? 'updating' : 'creating'} admin user.`
                )
            })
    }

    useEffect(() => {
        if (editing) {
            setForm({
                email: editing.email,
                active: editing.active,
                full_name: editing.full_name
            })
        }
    }, [editing])

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
                className="align-top sm:my-32 sm:max-w-xl"
                title={`${editing ? 'Update' : 'Add'} ${resource.name}`}
                open={creating || Boolean(editing)}
                setOpen={
                    Boolean(editing) ? () => setEditing(null) : setCreating
                }
            >
                <div className="py-6">
                    {editing ? (
                        <div className="mb-5">
                            <TextInput
                                value={form.full_name}
                                label="Full name"
                                name="full_name"
                                id="full_name"
                                error={errors.full_name as string}
                                onChange={event =>
                                    setForm({
                                        ...form,
                                        full_name: event.target.value
                                    })
                                }
                            />
                        </div>
                    ) : null}
                    <div className="mb-5">
                        <TextInput
                            value={form.email}
                            label="Email"
                            name="email"
                            id="email"
                            error={errors.email as string}
                            onChange={event =>
                                setForm({
                                    ...form,
                                    email: event.target.value
                                })
                            }
                        />
                    </div>
                    {editing ? (
                        <div className="mb-5">
                            <Checkbox
                                label="Active"
                                checked={form.active}
                                onChange={event =>
                                    setForm({
                                        ...form,
                                        active: event.target.checked
                                    })
                                }
                                name="active"
                                id="active"
                            />
                        </div>
                    ) : null}
                    <div className="mb-8">
                        {(() => {
                            const ManyToMany =
                                window.Tensei.components.form['ManyToMany']

                            const field = resource.fields.find(
                                f => f.name === 'Admin Role'
                            )

                            if (!field) {
                                return null
                            }

                            return (
                                <ManyToMany
                                    field={field}
                                    id="admin_roles"
                                    name="admin_roles"
                                    resource={resource}
                                    editing={!!editing}
                                    editingId={editing?.id}
                                    error={errors.admin_roles as string}
                                    onChange={(value: any[]) =>
                                        setForm({
                                            ...form,
                                            admin_roles: value
                                        })
                                    }
                                />
                            )
                        })()}
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
                            {editing ? 'Update' : 'Add User'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default ManageUser
