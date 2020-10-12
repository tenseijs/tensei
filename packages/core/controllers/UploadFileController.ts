import Express from 'express'

class UploadFileController {
    public async store(request: Express.Request, response: Express.Response) {
        const { files, storage } = request

        const fileFields: any[] = Object.values(files as {})
        const mimeType = fileFields[0].mimetype.split('/')[1]

        const storagePath = `${Date.now()}.${mimeType}`

        const file: any = await storage
            .disk()
            .put(storagePath, fileFields[0].data)

        if (!file.raw) {
            return response.status(201).json({
                filePath: storagePath
            })
        }
        return response.status(201).json({
            filePath: file.raw.Location
        })
    }
}

export default new UploadFileController()
