import { AllowedMimeTypes } from '@tensei/common'
import Field from './Field'

type UploadTypes = 'public' | 'private'

export class File extends Field {
    public uploadType: UploadTypes = 'public'

    public component = 'FileField'

    private config: {
        disableDownload: boolean
    } = {
            disableDownload: false,
        }

    /**
     * When a new file is made,
     * we'll allow it to be downloaded
     *
     */
    public constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.config.disableDownload = false
        this.attributes = {
            maxSize: 20000,
            allowedMimeTypes: ['*']
        }
    }

    /**
     * Upload a file and make it publicly accessible to anyone
     *
     */
    public public() {
        this.uploadType = 'public'

        return this
    }

    /**
     * Upload a file and make it private
     *
     */
    public private() {
        this.uploadType = 'private'

        return this
    }

    /**
     * Ensure that users cannot download the
     * created file
     *
     */
    public disableDownload() {
        this.config.disableDownload = true

        return this
    }
    /**
     * Set the mimetypes this file filed accepts.
     *
     */

    public allowedMimeTypes(mimeTypes: AllowedMimeTypes[]) {
        this.attributes = {
            ...this.attributes,
            allowedMimeTypes: mimeTypes
        }

        return this
    }

    /**
     * Set the max size for this file.
     *
     */
    public maxSize(size: number) {
        this.attributes = {
            ...this.attributes,
            maxSize: size
        }

        return this
    }

    public serialize() {
        return {
            ...super.serialize(),
            disableDownload: this.config.disableDownload,
        }
    }
}

export const file = (name: string, databaseField?: string) =>
    new File(name, databaseField)

export default File
