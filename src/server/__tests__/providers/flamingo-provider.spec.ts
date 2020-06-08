import Path from 'path'
import FlamingoProvider from '../../providers/FlamingoServiceProvider'

describe('The flamingo service provider', () => {
    it('instantiates the service provider config correctly ', () => {
        const TEST_PORT = '3000'
        const TEST_SESSION_SECRET = 'test-secret'
        const TEST_DATABASE_URI = 'mongodb://localhost://flamingo-testdb'

        process.env.PORT = TEST_PORT
        process.env.DATABASE_URI = TEST_DATABASE_URI
        process.env.SESSION_SECRET = TEST_SESSION_SECRET

        const instance = new FlamingoProvider(__dirname)

        instance.registerEnvironmentVariables()

        expect(instance.config).toEqual({
            port: TEST_PORT,
            databaseUri: TEST_DATABASE_URI,
            sessionSecret: TEST_SESSION_SECRET,
        })
    })

    it('instantiates the service provider with all properties', () => {
        const instance = new FlamingoProvider(__dirname)

        expect(instance.$root).toBe(__dirname)
    })

    it('can correctly load all resources', () => {
        const instance = new FlamingoProvider(
            Path.resolve(process.env.PWD!, 'src/server/__tests__')
        )

        instance.registerResources()

        expect(instance.resources).toHaveLength(3)

        const Post = require('./../resources/Post')
        const User = require('./../resources/User')
        const Todo = require('./../resources/Todo')

        expect(instance.resources[0]).toBeInstanceOf(Post)
        expect(instance.resources[1]).toBeInstanceOf(Todo.default)
        expect(instance.resources[2]).toBeInstanceOf(User)
    })

    it('correctly establishes a database connection', async () => {
        const instance = new FlamingoProvider(
            Path.resolve(process.env.PWD!, 'src/server/__tests__')
        )

        const TEST_DATABASE_URI = 'mongodb://localhost/flamingo-testdb'

        process.env.DATABASE_URI = TEST_DATABASE_URI

        instance.registerEnvironmentVariables()

        await instance.register()

        expect(instance.db).not.toBeNull()
        expect(instance.client).not.toBeNull()

        await instance.client?.db().collections()

        await instance.client?.close()
    })
})
