import React, { useState, useRef, useEffect } from 'react'
import { Modal, Button, Paragraph } from '@tensei/components'

import Tus from '@uppy/tus'
import Uppy from '@uppy/core'
import { Dashboard } from '@uppy/react'

import { niceBytes } from './helpers'

import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import './uppy.css'

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
    const [uppy] = useState(new Uppy({
        id: 'media-upload',
        autoProceed: false,
        debug: true,
    }).use(Tus, {
        endpoint: 'https://tusd.tusdemo.net/files/'
    }))

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
            className="media-align-top sm:media-my-32 sm:media-max-w-3xl"
        >
            <div className="mb-12">
                <Dashboard uppy={uppy} metaFields={[
                { id: 'name', name: 'Name', placeholder: 'File name' }
                ]} height='450px' />
            </div>
            <input
                ref={file}
                type="file"
                className="media-hidden"
                multiple
                onChange={onFilesSelected}
            />
            <Button secondary onClick={() => file.current.click()}>
                        Select Files
                    </Button>

            {/* {files.length === 0 ? (
                <div className="media-w-full media-py-16 media-flex media-justify-center media-items-center">
                    <Button secondary onClick={() => file.current.click()}>
                        Select Files
                    </Button>
                </div>
            ) : null}

            {files.length > 0 ? (
                <div className="media-w-full media-py-6">
                    <div className="media-relative media-pt-1">
                        <div className="media-flex media-mb-2 media-items-center media-justify-between">
                            <Paragraph
                                className={
                                    'media-font-semibold media-text-tensei-darkest'
                                }
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
                            <div className="media-text-right">
                                <span className="media-text-sm media-font-bold media-inline-block media-text-tensei-primary-darker">
                                    {progress}%
                                </span>
                            </div>
                        </div>
                        <div className="media-overflow-hidden media-h-2 media-mb-4 media-text-xs media-flex media-rounded media-bg-tensei-primary-200">
                            <div
                                style={{ width: `${progress}%` }}
                                className="media-shadow-none media-transition media-ease-in-out media-duration-100 media-flex media-flex-col media-text-center media-whitespace-nowrap media-text-white media-justify-center media-bg-tensei-primary"
                            ></div>
                        </div>
                    </div>
                </div>
            ) : null} */}
        </Modal>
    )
}

export default UploadFiles
