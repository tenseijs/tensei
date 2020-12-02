import Fs from 'fs'

export interface UploadFile {
    hash: string
    size: number
    mimetype: string
    extension: string
    filename: string
    storage_filename: string
    createReadStream: () => Fs.ReadStream
}

export interface MediaLibraryPluginConfig {
    disk: string
    maxFiles: number
    maxFileSize: number
}
