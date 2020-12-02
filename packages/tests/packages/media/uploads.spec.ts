import Supertest from 'supertest'
import { setup, gql, getFileFixture } from './setup'

test('Can upload files using the graphql plugin', async () => {
    const {
        app,
        ctx: { storage, resourcesMap, orm }
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
                0: ['variables.files.0'],
                1: ['variables.files.1'],
                2: ['variables.files.2']
            })
        )
        .attach('0', getFileFixture('pdf.pdf'))
        .attach('1', getFileFixture('png.png'))
        .attach('2', getFileFixture('zip.zip'))

    const uploaded_files = response.body.data.upload_files

    expect(uploaded_files).toHaveLength(3)

    const files = await Promise.all(
        uploaded_files.map((file: any) =>
            storage.disk().getStat(`${file.path}${file.hash}.${file.extension}`)
        )
    )

    uploaded_files.forEach((file, index) => {
        expect(file.path).toEqual('/profiles/avatars/')
        expect((files[index] as any).size).toEqual(file.size)
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
