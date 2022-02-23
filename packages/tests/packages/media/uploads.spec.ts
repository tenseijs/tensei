import Supertest from 'supertest'
import { setup, gql, getFileFixture } from './setup'

test('Cannot upload more than max files', async () => {
  const { app } = await setup()

  const client = Supertest(app)

  const query = gql`
    mutation uploadFiles($files: [Upload]!, $path: String) {
      uploadFiles(object: { files: $files, path: $path }) {
        id
        size
        path
        hash
        mimeType
        extension
        name
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

test.skip('Cannot upload files larger than max file size', async () => {
  const maxFileSize = 3200
  const { app } = await setup(maxFileSize)

  const client = Supertest(app)

  const query = gql`
    mutation uploadFiles($files: [Upload]!, $path: String) {
      uploadFiles(object: { files: $files, path: $path }) {
        id
        size
        path
        hash
        mimeType
        extension
        name
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

test('Can upload files using the rest plugin', async () => {
  const { app } = await setup(100000000, 48)

  const response = await Supertest(app)
    .post('/files/upload')
    .set('Content-Type', 'multipart/form-data')
    .attach('files', getFileFixture('pdf.pdf'))
    .attach('files', getFileFixture('png.png'))
    .attach('files', getFileFixture('zip.zip'))
    .attach('files', getFileFixture('pdf.pdf'))
    .attach('files', getFileFixture('png.png'))

  expect(response.status).toBe(201)
  expect(response.body.data).toHaveLength(5)
})
