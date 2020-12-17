import React from 'react'
import ReactDOM from 'react-dom'
import { useEffect } from 'react'
import { useState } from 'react'
import { Transition } from '@headlessui/react'

export interface ModalProps {
    root?: string
    open: boolean
    setOpen: (open: boolean) => void
}

const Modal: React.FC<ModalProps> = ({
    root = '#modal-root',
    open,
    children
}) => {
    const [el] = useState(document.createElement('div'))
    const modalRoot = document.querySelector(root)

    useEffect(() => {
        modalRoot?.appendChild(el)
    }, [])

    return ReactDOM.createPortal(
        <Transition show={open}>
            <div className="fixed z-10 inset-0 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div
                            aria-hidden={!open}
                            className="fixed inset-0 transition-opacity"
                        >
                            <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
                        </div>
                    </Transition.Child>
                    {/* This element is to trick the browser into centering the modal contents. */}
                    <span
                        aria-hidden={!open}
                        className="hidden sm:inline-block sm:align-middle sm:h-screen"
                    ></span>
                    &#8203;
                    <Transition.Child
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        {ref => (
                            <div
                                ref={ref}
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="modal-headline"
                                className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
                            >
                                {children}
                            </div>
                        )}
                    </Transition.Child>
                </div>
            </div>
        </Transition>,
        el
    )
}

export default Modal
