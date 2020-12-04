require('dotenv').config()
const { auth } = require('@tensei/auth')
const { next } = require('@tensei/next')
const { tensei } = require('@tensei/core')
const { graphql } = require('@tensei/graphql')

tensei()
    .plugins([auth().plugin(), next().plugin(), graphql().plugin()])
    .db({
        dbName: 'mikrotensei.sqlite',
        type: 'sqlite'
    })
    .start()
