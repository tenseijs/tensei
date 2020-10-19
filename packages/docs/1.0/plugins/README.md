# The Basics

[[toc]]

Sometimes, your business or application may need additional functionality that isn't provided by Tensei. For this reason, Tensei provides an extensible API to extend your application or dashboard with custom functionality. This can range from custom dashboard fields, pages, dashboard sidebar items to custom API routes, endpoints and database operations.

## Backend

### Defining plugins
You can define a plugin using the `plugin` method from the `@tensei/core` package. Plugins need a name for identification.

```javascript
const { plugin } = require('@tensei/core')

module.exports = plugin('Newsletter')
```

### Registering plugins

You can register plugins to the Tensei application using the `.plugins()` method:

```javascript
const { tensei, plugin } = require('@tensei/core')

tensei()
    .plugins([
        plugin('Newsletter')
    ])
```

### Building plugins

Plugins can hook into several Tensei lifecycle methods. The plugin provides callbacks that will be called during the lifecycle of the the application registration process.

- `beforeDatabaseSetup`: Called before the database is setup. Use this hook if you want to register new resources to the application.

- `afterDatabaseSetup`: Called after the database is setup. Use this hook if you want to run operations against the database.

- `beforeMiddlewareSetup`: Called before core middleware such as sessions, body parser, loggers are registered. Use this if you need to register middleware that need to come before any core middleware. 

- `afterMiddlewareSetup`: Called after core middleware are registered.

- `beforeCoreRoutesSetup`: Called before the core dashboard and REST API routes are setup. If you have routes that need to be configured before these ones, use this hook.

- `afterCoreRoutesSetup`: Called after the core dashboard and REST API routes are setup

- `setup`: Called after the application is completely registered. You can use this for custom validation rules, custom css styles/scripts, storage drivers, mail drivers or any other registration into the application.

For example, if you're creating a newsletter plugin, and need to save default options to the database, you need to call the `.afterDatabaseSetup` method, so you get access to the database.

```js
const { tensei, plugin } = require('@tensei/core')

tensei()
    .plugins([
        plugin('Newsletter')
            .afterDatabaseSetup(async ({ resources, app, manager }) => {
                await manager('Setting').database().create({...})
            })
    ])
```

With plugins you have access to the whole application. You can register custom routes, 

## Frontend
A plugin can add custom sidebar items to the dashboard. To be able to modify the frontend, first the plugin needs to register a client side npm script. 
