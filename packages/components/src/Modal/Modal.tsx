import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import { useEffect } from 'react'
import { useState } from 'react'
import { Transition } from '@headlessui/react'

import Heading from '../Typography/Heading'

export interface ModalProps {
  root?: string
  open: boolean
  title?: string
  className?: string
  noPadding?: boolean
  closeOnBackdropClick?: boolean
  setOpen: (open: boolean) => void
}

const Modal: React.FC<ModalProps> = ({
  root = '#modal-root',
  open,
  title,
  setOpen,
  children,
  noPadding,
  className,
  closeOnBackdropClick = true
}) => {
  const [el] = useState(document.createElement('div'))
  const modalRoot = document.querySelector(root)

  useEffect(() => {
    modalRoot?.appendChild(el)
  }, [])

  return ReactDOM.createPortal(
    <Transition.Root show={open || false}>
      <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
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
              <div
                className="absolute inset-0 bg-gray-900 opacity-50"
                onClick={
                  closeOnBackdropClick ? () => setOpen(false) : undefined
                }
              ></div>
            </div>
          </Transition.Child>
          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            aria-hidden={!open}
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
          ></span>
          &#8203;
          <Transition.Child
            as={Fragment}
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
                className={`inline-block bg-white rounded ${
                  noPadding ? '' : 'px-4 pt-5 pb-4 sm:p-6'
                } text-left overflow-visible shadow-xl transform transition-all w-full ${
                  className || ''
                }`}
              >
                {title ? (
                  <div className="w-full flex py-5 px-8 justify-between border-b border-tensei-gray-500">
                    <Heading as="h3" className="font-semibold">
                      {title}
                    </Heading>

                    <svg
                      className="cursor-pointer"
                      onClick={() => setOpen(false)}
                      width={26}
                      height={26}
                      viewBox="0 0 26 26"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx={13}
                        cy={13}
                        r={13}
                        className="fill-current text-tensei-gray-300"
                      />
                      <rect
                        className="fill-current text-tensei-gray-800"
                        x="7.28564"
                        y="8.81055"
                        width="2.15499"
                        height="14.0074"
                        transform="rotate(-45 7.28564 8.81055)"
                      />
                      <rect
                        className="fill-current text-tensei-gray-800"
                        x="17.1904"
                        y="7.28516"
                        width="2.15499"
                        height="14.0074"
                        transform="rotate(45 17.1904 7.28516)"
                      />
                    </svg>
                  </div>
                ) : null}
                {title ? <div className="px-8">{children}</div> : children}
              </div>
            )}
          </Transition.Child>
        </div>
      </div>
    </Transition.Root>,
    el
  )
}

export default Modal
