# Databases

[[toc]]

Tensie supports [MongoDB](https://mongodb.org), [Mysql](https://mysql.com), [Postgres](https://postgresql.org) and [Sqlite](https://sqlite.org). It uses [Knex.js](https://knexjs.org) under the hood to communicate with `mysql`, `pg`, and `sqlite`, and uses [Mongoose](https://mongoose.org) to support `mongodb`.

## Installing database dependencies
If you plan on using mysql, pg, or sqlite, you need to install the `@tensei/knex` package, and either `mysql`, `pg`, or `sqlite3` depending on the database you'll be using.

```bash
yarn add @tensei/knex mysql
yarn add @tensei/knex pg
yarn add @tensei/knex sqlite3

# Or with npm
npm install @tensei/knex mysql --save
npm install @tensei/knex pg --save
npm install @tensei/knex sqlite3 --save 
```

If you plan on using mongodb, you need to install the `@tensei/mongoose` package.

```bash
yarn add @tensei/mongoose

# Or with npm
npm install @tensei/mongoose --save
```

## Defining the database
After installing the package for your specific database, you need to configure Tensei to know which database you'll be using. This will tell Tensei how to correctly load the database package. You can configure your database using the `.database()` method, passing in the name of the database.

```js
const { tensei } = require('@tensei/core')

tensei()
    .database('mongodb') // for mongodb users

tensei()
    .database('mysql') // for mysql users

tensei()
    .database('sqlite') // for sqlite users -> Defaults to sqlite if no database is defined

tensei()
    .database('pg')
```

## Connecting to a database
To connect to a database, you need to provide the database connection configuration using the `.databaseConfig()` method on the Tensei instance.

```js
const { tensei } = require('@tensei/core')

tensei()
    .databaseConfig({
        client: 'mysql',
        connection: {
            host: '127.0.0.1',
            user: 'root',
            password: '',
            port: 3306
            // all other options supported by knex
        }
    })
```

The options passed to the `.databaseConfig()` method are passed to knex directly to establish a connection. Learn more about [knex options ](https://knexjs.org/#Installation-client).

If you are connecting to a mongodb database, these options would be the options required by the [mongoose.connect](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-connect) method. Here's an example:

```js
const { tensei } = require('@tensei/core')

tensei()
    .database('mongodb')
    .databaseConfig('mongodb://127.0.0.1/tensei-db', {
        useNewUrlParser: true
    })
```

::: tip
Make sure you call the `.databaseConfig()` and `.database()` method before the `.register()` method, because calling the `.register()` method would try to establish a database connection, and it needs the configuration.
:::

## Getting the database connection
After creating a tensei instance, you can get the database client or connection using the `getDatabaseClient()` method like this:

```js
const { tensei } = require('@tensei/core')

tensei()
    .database('mongodb')
    .databaseConfig('mongodb://127.0.0.1/tensei-db', {
        useNewUrlParser: true
    })
    .register()
    .then(({ getDatabaseClient }) => {
        const connection = getDatabaseClient() // This is equivalent to Mongoose.connection

        connection.close()
    })
```

If you are using knex, the `getDatabaseClient` method would return a knex instance.

```js
const { tensei } = require('@tensei/core')

tensei()
    .database('pg')
    .databaseConfig({
        client: 'pg',
        connection: {
            host: '127.0.0.1',
            user: 'root',
            password: '',
            port: 3306
            // all other options supported by knex
        }
    })
    .register()
    .then(({ getDatabaseClient }) => {
        const knex = getDatabaseClient()

        // destroy connection after running some commands
        knex('users').insert([...])
    })
```

This is very useful when building a CLI tool, or running commands after Tensei has correctly connected to the database.
