import React, { useState, useRef, useEffect } from 'react'
import { Modal, Button, Paragraph } from '@tensei/components'

import { niceBytes } from './helpers'

const UploadFiles = ({
    open,
    setOpen,
    onUploaded,
    detailId,
    relatedResource
}) => {
    const file = useRef(null)
    const [files, setFiles] = useState([])
    const [progress, setProgress] = useState(0)

    const onFilesSelected = event => {
        setFiles(Array.from(event.target.files))
    }

    const uploadFiles = () => {
        const form = new FormData()

        files.forEach((file, index) => {
            form.append(`files[${index}]`, file)
        })

        window.axios
            .create({
                xsrfCookieName: 'x-csrf-token'
            })
            .post(
                detailId
                    ? `/${relatedResource.slug}/${detailId}/files/upload`
                    : '/files/upload',
                form,
                {
                    onUploadProgress: progressEvent => {
                        setProgress(
                            Math.round(
                                (progressEvent.loaded * 100) /
                                    progressEvent.total
                            )
                        )
                    }
                }
            )
            .then(() => {
                if (onUploaded) {
                    onUploaded()
                }

                setFiles([])
                setOpen(false)
                window.Tensei.success(`Media uploaded.`)
            })
            .catch(error => {
                setFiles([])
                setOpen(false)

                let message = `Failed uploading media.`

                if (
                    error &&
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) {
                    message = error.response.data.message
                }

                window.Tensei.error(message)
            })
    }

    useEffect(() => {
        if (files.length !== 0) {
            uploadFiles()
        }
    }, [files.length])

    return (
        <Modal
            noPadding
            closeOnBackdropClick={false}
            open={open}
            setOpen={setOpen}
            title="Upload media"
            className="align-top sm:my-32 sm:max-w-3xl"
        >
            <input
                ref={file}
                type="file"
                className="hidden"
                multiple
                onChange={onFilesSelected}
            />

            {files.length === 0 ? (
                <div className="w-full py-16 flex justify-center items-center">
                    <Button secondary onClick={() => file.current.click()}>
                        Select Files
                    </Button>
                </div>
            ) : null}

            {files.length > 0 ? (
                <div className="w-full py-6">
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <Paragraph
                                className={'font-semibold text-tensei-darkest'}
                            >
                                Uploading {files.length} files (
                                {niceBytes(
                                    files.reduce(
                                        (total, file) => total + file.size,
                                        0
                                    )
                                )}{' '}
                                in total.)
                            </Paragraph>
                            <div className="text-right">
                                <span className="text-sm font-bold inline-block text-tensei-primary-darker">
                                    {progress}%
                                </span>
                            </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-tensei-primary-200">
                            <div
                                style={{ width: `${progress}%` }}
                                className="shadow-none transition ease-in-out duration-100 flex flex-col text-center whitespace-nowrap text-white justify-center bg-tensei-primary"
                            ></div>
                        </div>
                    </div>
                </div>
            ) : null}
        </Modal>
    )
}

export default UploadFiles
