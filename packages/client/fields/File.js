import React from 'react'
import { Button } from '@contentful/forma-36-react-components'

class FileField extends React.Component {
    constructor() {
        super()
        this.inputFile = React.createRef()
    }

    state = { uploadedFile: null, loading: false }

    uploadFile = async e => {
        this.setState({ loading: true })

        // add file to pending uploads array and wait for response
        this.props.addPendingField(this.props.field.inputName)

        const imageUploadData = new FormData()
        imageUploadData.append(this.props.field.inputName, e.target.files[0])

        Tensei.request
            .post(
                `resources/${this.props.resource.slug}/upload/${this.props.field.inputName}`,
                imageUploadData
            )
            .then(({ data }) => {
                this.props.removePendingField(this.props.field.inputName)
                this.setState({ uploadedFile: data.filePath, loading: false })
            })
            .catch(error => {
                let errorMessage = 'Could not upload file, try again!'
                if (error.response.status === 422) {
                    errorMessage = error.response.data.message
                }
                Tensei.library.Notification.error(errorMessage)

                this.props.removePendingField(this.props.field.inputName)
                this.setState({ loading: false })
            })
    }

    render() {
        const { loading, uploadedFile } = this.state

        return (
            <div className="TextField">
                <div className="flex items-center">
                    <Button
                        onClick={() => this.inputFile.current.click()}
                        loading={loading}
                    >
                        Choose file
                    </Button>
                    <span className="ml-2 text-sm">
                        {uploadedFile || 'No file selected'}
                    </span>
                </div>
                <input
                    type="file"
                    className="hidden"
                    ref={this.inputFile}
                    onChange={e => this.uploadFile(e)}
                />
            </div>
        )
    }
}

export default FileField
