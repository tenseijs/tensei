import Fs from 'fs'
import { Sharp, Metadata } from 'sharp'

export interface UploadFile {
  hash: string
  size: number
  width: number
  path: string
  height: number
  mimetype: string
  extension: string
  filename: string
  storage_filename: string
  transformations: UploadFile[]
  createReadStream: () => Fs.ReadStream
}

export type TransformCallback = [(meta?: Metadata) => Sharp | undefined, string]

export interface MediaLibraryPluginConfig {
  disk: string
  path: string
  maxFiles: number
  maxFileSize: number
  maxFieldSize: number
  transformations: TransformCallback[]
}
