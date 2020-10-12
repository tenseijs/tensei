import { AllowedMimeTypes } from '@tensei/common'
import Field from './Field'

type AllowedDisks = 'public' | 'private'

export class File extends Field {
    public uploadType: AllowedDisks = 'public'

    public component = 'FileField'

    private config: {
        allowedMimeTypes: AllowedMimeTypes[]
        disableDownload: boolean
    } = {
        disableDownload: false,
        allowedMimeTypes: ['*']
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
            maxSize: 20000
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

    public allowedMimeTypes(mimeTypes: AllowedMimeTypes[]) {
        this.config.allowedMimeTypes = mimeTypes
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
            allowedMimeTypes: this.config.allowedMimeTypes
        }
    }
}

export const file = (name: string, databaseField?: string) =>
    new File(name, databaseField)

export default File
