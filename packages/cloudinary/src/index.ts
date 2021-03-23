import Path from 'path'
import { plugin } from '@tensei/common'

import { CloudinaryStorage } from './CloudinaryStorage'

class Cloudinary {
    private config = {
        cloud_name: '',
        api_key: '',
        api_secret: '',
        cloudinary_url: process.env.CLOUDINARY_URL
    }

    name(name: string) {
        this.config.cloud_name = name

        return this
    }

    key(key: string) {
        this.config.api_key = key

        return this
    }

    secret(secret: string) {
        this.config.api_secret = secret

        return this
    }

    url(cloudinary_url: string) {
        this.config.cloudinary_url = cloudinary_url

        return this
    }

    plugin() {
        return plugin('cloudinary').register(({ storageDriver }) => {
            storageDriver('cloudinary', {}, CloudinaryStorage)
        })
    }
}

export const cloudinary = () => new Cloudinary()
