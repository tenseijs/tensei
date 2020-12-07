import React from 'react'

import Modal from './Modal'
import Button from '../Button'

export interface ConfirmModalProps {
    open: boolean
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
    setOpen: (open: boolean) => void
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    setOpen,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm
}) => {
    return (
        <Modal open={open} setOpen={setOpen}>
            <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                        id="modal-headline"
                        className="text-lg leading-6 font-medium text-tensei-darkest"
                    >
                        {title}
                    </h3>
                    <div className="my-3">
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:pl-4 sm:flex">
                <Button danger onClick={onConfirm}>
                    {confirmText}
                </Button>
                <Button clear onClick={() => setOpen(false)}>
                    {cancelText}
                </Button>
            </div>
        </Modal>
    )
}

export default ConfirmModal
