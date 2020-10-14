import Express from 'express'
import { v4 as uuidv4 } from 'uuid';

type File = {
    name: string
    mv: () => void
    mimetype: string
    size: number
    data: string[]
}

class UploadFileController {
    public store = async (
        request: Express.Request,
        response: Express.Response
    ) => {
        const { files, storage, params, resources } = request

        const fieldInputName = params.fieldInputName
        const fileFields: any = files?.[fieldInputName]
        const resourceFields: any = resources[params.resource].data.fields.find(
            field => field.databaseField === fieldInputName
        )

        const isFileValid = this.validateFile(resourceFields, fileFields)

        if (isFileValid) {
            return response.status(422).json({
                message: isFileValid,
                status: 422
            })
        }

        const mimeType = fileFields.mimetype.split('/')[1]

        const storagePath = `${uuidv4()}.${mimeType}`

        const file: any = await storage
            .disk()
            .put(storagePath, fileFields.data)

        if (!file.raw) {
            return response.status(201).json({
                filePath: `storage/${storagePath}`
            })
        }
        return response.status(201).json({
            filePath: file.raw.Location
        })
    }

    private validateFile = (resourceFields: any, file: File) => {
        let validationError = null
        const fieldMaxSize = resourceFields.attributes.maxSize
        const fieldMimeTypesAllowed = resourceFields.attributes.allowedMimeTypes

        const fileSizeInKB = (file.size * 0.001).toFixed()
        const fileMimeType = file.mimetype

        if (fieldMaxSize < fileSizeInKB) {
            validationError = 'File size is larger than maximum size allowed'
        }
        if (
            !fieldMimeTypesAllowed.includes(fileMimeType) &&
            !fieldMimeTypesAllowed.includes('*')
        ) {
            validationError = 'This file type is not part of the allowed types'
        }
        return validationError
    }
}

export default new UploadFileController()
