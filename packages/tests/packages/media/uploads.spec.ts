import Supertest from 'supertest'
import { setup, gql, getFileFixture } from './setup'

test('Can upload files using the graphql plugin', async () => {
    const {
        app,
        ctx: { storage, orm }
    } = await setup()

    const client = Supertest(app)

    const query = gql`
        mutation upload_files($files: [Upload]!, $path: String) {
            upload_files(object: { files: $files, path: $path }) {
                id
                size
                path
                hash
                mime_type
                extension
                original_filename
            }
        }
    `

    const response = await client
        .post('/graphql')
        .set('Content-Type', 'multipart/form-data')
        .field(
            'operations',
            JSON.stringify({
                query,
                variables: {
                    files: [null, null, null],
                    path: '/profiles/avatars'
                }
            })
        )
        .field(
            'map',
            JSON.stringify({
                file_0: ['variables.files.0'],
                file_1: ['variables.files.1'],
                file_2: ['variables.files.2']
            })
        )
        .attach('file_0', getFileFixture('pdf.pdf'))
        .attach('file_1', getFileFixture('png.png'))
        .attach('file_2', getFileFixture('zip.zip'))

    const uploaded_files = response.body.data.upload_files

    expect(uploaded_files).toHaveLength(3)

    const files = await Promise.all(
        uploaded_files.map((file: any) =>
            storage.disk().getStat(`${file.path}${file.hash}.${file.extension}`)
        )
    )

    uploaded_files.forEach((file, index) => {
        expect(file.path).toEqual('/profiles/avatars/')
        expect((files[index] as any).size.toString()).toEqual(file.size)
    })

    const meeting = orm.em.create('Meeting', {
        name: 'Meeting 1',
        screenshots: [uploaded_files[0].id, uploaded_files[1].id]
    })

    const gist = orm.em.create('Gist', {
        name: 'Gist 1',
        attachments: [uploaded_files[2].id]
    })

    await orm.em.persistAndFlush([gist, meeting])

    await orm.em.populate(gist, ['attachments'])
    await orm.em.populate(meeting, ['screenshots'])

    expect(meeting.screenshots[0].id.toString()).toEqual(uploaded_files[0].id)
    expect(meeting.screenshots[1].id.toString()).toEqual(uploaded_files[1].id)

    expect(gist.attachments[0].id.toString()).toEqual(uploaded_files[2].id)
})

test('Cannot upload more than max files', async () => {
    const {
        app,
        ctx: { storage, orm }
    } = await setup()

    const client = Supertest(app)

    const query = gql`
        mutation upload_files($files: [Upload]!, $path: String) {
            upload_files(object: { files: $files, path: $path }) {
                id
                size
                path
                hash
                mime_type
                extension
                original_filename
            }
        }
    `

    const response = await client
        .post('/graphql')
        .set('Content-Type', 'multipart/form-data')
        .field(
            'operations',
            JSON.stringify({
                query,
                variables: {
                    files: [null, null, null],
                    path: '/profiles/avatars'
                }
            })
        )
        .field(
            'map',
            JSON.stringify({
                file_0: ['variables.files.0'],
                file_1: ['variables.files.1'],
                file_2: ['variables.files.2'],
                file_3: ['variables.files.3'],
                file_4: ['variables.files.4']
            })
        )
        .attach('file_0', getFileFixture('pdf.pdf'))
        .attach('file_1', getFileFixture('png.png'))
        .attach('file_2', getFileFixture('zip.zip'))
        .attach('file_3', getFileFixture('zip.zip'))
        .attach('file_4', getFileFixture('zip.zip'))

    expect(response.body).toEqual({
        message: '4 max file uploads exceeded.'
    })
})

test('Cannot upload files larger than max file size', async () => {
    const maxFileSize = 3200
    const {
        app,
        ctx: { storage, orm }
    } = await setup(maxFileSize)

    const client = Supertest(app)

    const query = gql`
        mutation upload_files($files: [Upload]!, $path: String) {
            upload_files(object: { files: $files, path: $path }) {
                id
                size
                path
                hash
                mime_type
                extension
                original_filename
            }
        }
    `

    const response = await client
        .post('/graphql')
        .set('Content-Type', 'multipart/form-data')
        .field(
            'operations',
            JSON.stringify({
                query,
                variables: {
                    files: [null],
                    path: '/profiles/avatars'
                }
            })
        )
        .field(
            'map',
            JSON.stringify({
                file_0: ['variables.files.0']
            })
        )
        .attach('file_0', getFileFixture('pdf.pdf'))

    expect(response.body.errors[0].extensions.exception.message).toEqual(
        `File truncated as it exceeds the ${maxFileSize} byte size limit.`
    )
})
