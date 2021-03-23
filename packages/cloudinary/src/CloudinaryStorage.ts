import Fs from 'fs'
import Cloudinary from 'cloudinary'
import { Storage, Response, UnknownException } from '@slynova/flydrive'

function handleError(error: Error, path: string) {
    console.error(error)
    switch (error.name) {
        default:
            return error
    }
}

export class CloudinaryStorage extends Storage {
    private $driver = Cloudinary.v2

    constructor() {
        super()
    }

    public async delete(location: string) {
        try {
            const response = await this.$driver.api.delete_resources([location])

            return {
                wasDeleted: response.deleted[location] === 'deleted',
                raw: response
            }
        } catch (error) {
            console.error(error)
            throw handleError(error, location)
        }
    }

    public async getStat(location: string) {
        try {
            const response = await this.$driver.api.resource(this.derivePublicIdFromLocation(location))

            return {
                size: response.bytes,
                modified: undefined as any,
                raw: response
            }
        } catch (error) {
            throw handleError(error, location)
        }
    }

    private derivePublicIdFromLocation(location: string) {
        let public_id = location.startsWith('/') ? location.substring(1) : location

        return public_id.split('.')[0]
    }

    public async put(location: string, content: NodeJS.ReadableStream | string) { 
        let stream = content as NodeJS.ReadableStream

        if (typeof content === 'string') {
            stream = Fs.createReadStream(content)
        }

        return new Promise<Response>((resolve, reject) => {
            stream.pipe(
                this.$driver.uploader.upload_stream({
                    public_id: this.derivePublicIdFromLocation(location)
                }, (error, image) => {
                    if (error) {
                        return reject(handleError(error, location))
                    }

                    return resolve({
                        raw: image
                    })
                })
            )
        })
    }
}
