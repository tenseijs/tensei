import React, { useState } from 'react'
import {
    Dropdown,
    DropdownListItem,
    Button,
    Icon,
    Modal,
    TextLink,
    ModalConfirm
} from '@contentful/forma-36-react-components'
import { withAuth } from '~/store/auth'

const ActionsDropdown = ({
    position = 'index',
    resource,
    selected = [],
    auth
}) => {
    const [form, setForm] = useState({})
    const [action, setAction] = useState(null)
    const [errors, setErrors] = useState({})
    const [htmlResponse, setHtmlResponse] = useState(null)
    const [runningAction, setRunningAction] = useState(false)
    const [showActionsDropdown, setShowActionsDropdown] = useState(false)

    // position can be index, detail, table-row
    const actions = resource.actions.filter(action => {
        const authorizedToRunAction = auth.authorizedToRunAction(
            action.slug,
            resource.slug
        )

        if (position === 'index') {
            return action.showOnIndex && authorizedToRunAction
        }

        if (position === 'detail') {
            return action.showOnDetail && authorizedToRunAction
        }

        if (position === 'table-row') {
            return action.showOnTableRow && authorizedToRunAction
        }

        return false
    })

    const toggleActionsDropdown = () =>
        setShowActionsDropdown(!showActionsDropdown)

    if (actions.length === 0) {
        return null
    }

    const setDefaultFormState = action => {
        if (action.fields.length === 0) {
            return
        }

        const defaultForm = {}

        action.fields.forEach(field => {
            defaultForm[field.inputName] = field.defaultValue || ''
        })

        setForm(defaultForm)
    }

    const showActionModal = action => {
        setAction(action)
        toggleActionsDropdown()

        setDefaultFormState(action)
    }

    const renderField = field => {
        const Component = Tensei.fieldComponents[field.component]

        if (!Component) {
            return null
        }

        return (
            <div key={field.inputName} className="mb-3">
                <Component
                    field={field}
                    resource={resource}
                    label={field.name}
                    value={form[field.inputName] || ''}
                    errorMessage={errors[field.inputName] || ''}
                    onFieldChange={value => {
                        setForm({
                            ...form,
                            [field.inputName]: value
                        })
                    }}
                />
            </div>
        )
    }

    const handleResponse = response => {
        if (!response) {
            closeModal()

            return
        }
        if (!response.type) {
            let parsedErrors = {}

            error?.response?.data?.errors?.forEach(error => {
                parsedErrors[error.field] = error.message
            })

            setErrors(parsedErrors)

            return
        }

        if (response.type === 'notification') {
            Tensei.library.Notification.setPosition(response.position)
            switch (response.variant) {
                case 'positive':
                    Tensei.library.Notification.success(response.message)
                    break
                case 'negative':
                    Tensei.library.Notification.error(response.message)
                    break
                case 'warning':
                    Tensei.library.Notification.warning(response.message)
                    break
            }

            closeModal()

            return
        }

        if (response.type === 'html') {
            setHtmlResponse(response.html)

            return
        }
    }

    const closeModal = () => {
        setForm({})
        setErrors({})
        setAction(null)
        setHtmlResponse(null)
        setRunningAction(false)
        setShowActionsDropdown(false)
    }

    const confirmAction = () => {
        setRunningAction(true)

        Tensei.request
            .post(`resources/${resource.slug}/actions/${action.slug}`, {
                models: selected,
                form
            })
            .then(({ data }) => {
                handleResponse(data)

                setRunningAction(false)
            })
            .catch(error => {
                handleResponse(error?.response?.data)

                setRunningAction(false)
            })
    }

    return (
        <>
            <Dropdown
                isAutoalignmentEnabled={true}
                onClose={toggleActionsDropdown}
                isOpen={showActionsDropdown}
                toggleElement={
                    position === 'table-row' ? (
                        <TextLink
                            data-testid="action-link"
                            onClick={toggleActionsDropdown}
                            disabled={selected.length === 0}
                        >
                            Actions <Icon icon="ChevronDown" color="muted" />
                        </TextLink>
                    ) : (
                        <Button
                            buttonType="muted"
                            disabled={selected.length === 0}
                            onClick={toggleActionsDropdown}
                        >
                            Actions <Icon icon="ChevronDown" color="muted" />
                        </Button>
                    )
                }
            >
                {actions.map(action => (
                    <DropdownListItem
                        key={action.slug}
                        onClick={() => showActionModal(action)}
                    >
                        {action.name}
                    </DropdownListItem>
                ))}
            </Dropdown>

            <ModalConfirm
                isConfirmLoading={runningAction}
                onConfirm={confirmAction}
                confirmLabel={action ? action.confirmButtonText : ''}
                cancelLabel={action ? action.cancelLabel : ''}
                intent={action ? action.intent : 'primary'}
                isShown={!!action}
                title={action ? action.name : ''}
                onCancel={closeModal}
            >
                {action && action.fields.length === 0 ? (
                    <p>{action.confirmText}</p>
                ) : null}

                {action ? action.fields.map(field => renderField(field)) : null}
            </ModalConfirm>

            <Modal
                allowHeightOverflow={true}
                isShown={!!action && !!htmlResponse}
                title={action ? `${action.name} - Results` : ''}
                onClose={closeModal}
            >
                <Modal.Content>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: htmlResponse
                        }}
                    ></div>
                </Modal.Content>
            </Modal>
        </>
    )
}

export default withAuth(ActionsDropdown)
