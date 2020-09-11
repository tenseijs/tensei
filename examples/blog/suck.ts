import { tensei } from '@tensei/core'
import { Repository } from '@tensei/knex'

tensei()
    .apiPath('beans')
    .dashboardPath('dashboard')
    .databaseConfig({
        client: 'mysql',
        connection: {
            host: '',
            user: '',
            password: ''
        },
        searchPath: '//'
    })
    .register()
    .then(({ app }) => {
        app.get('/nova', (request, response, ) => {
            // const Admin = request.resources['admin'].Model()
        })
    })
