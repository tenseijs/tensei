import React from 'react'

import Modal from './Modal'
import Button, { ButtonProps } from '../Button'

export interface ConfirmModalProps {
    open: boolean
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
    confirmButtonProps?: ButtonProps
    cancelButtonProps?: ButtonProps
    setOpen: (open: boolean) => void
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    setOpen,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    confirmButtonProps,
    cancelButtonProps
}) => {
    return (
        <Modal open={open} setOpen={setOpen}>
            <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                        id="modal-headline"
                        className="text-xl mb-6 leading-6 font-semibold text-tensei-darkest"
                    >
                        {title}
                    </h3>
                    <div className="mb-3">
                        <p>{description}</p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:pl-4 sm:flex">
                <Button
                    danger
                    onClick={onConfirm}
                    {...(confirmButtonProps || {})}
                >
                    {confirmText}
                </Button>
                <Button
                    className="mt-3 md:mt-0"
                    clear
                    onClick={() => setOpen(false)}
                    {...(cancelButtonProps || {})}
                >
                    {cancelText}
                </Button>
            </div>
        </Modal>
    )
}

export default ConfirmModal
