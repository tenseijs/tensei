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

export interface Transformation {}

export interface MediaLibraryPluginConfig {
    disk: string
    path: string
    maxFiles: number
    maxFileSize: number
    maxFieldSize: number
    transformations: Transformation[]
}
