import { tensei } from '@tensei/core'
import * as Mongoose from '@tensei/mongoose'

tensei()
    .apiPath('beans')
    .dashboardPath('dashboard')
    .database('mongodb')
    .databaseConfig('mongodb://localhost/tensei')
    .register()
    .then(({ app }) => {
        app.get('/nova', (request, response, ) => {
            // const Admin = request.resources['admin'].Model()
        })
    })
