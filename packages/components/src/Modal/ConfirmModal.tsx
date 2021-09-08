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
    <Modal
      open={open}
      setOpen={setOpen}
      className="align-bottom sm:align-middle sm:max-w-lg"
    >
      <div className="sm:flex sm:items-start">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <h3 className="mb-6 font-bold text-tensei-darkest">{title}</h3>
          <div className="mb-3 text-13px">
            <p>{description}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex">
        <Button danger onClick={onConfirm} {...(confirmButtonProps || {})}>
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
