import Supertest from 'supertest'
import { setup } from './setup'

test('The graphql plugin setup', async () => {
    const { app } = await setup()

    console.log(app)
})
