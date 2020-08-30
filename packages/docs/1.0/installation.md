# Installation

[[toc]]

Tensei CMS is an open-source, easy to use, developer first headless CMS for rapidly building javascript applications. It comes built in with a beautiful, highly customizable dashboard to administer your database records.

## Requirements
Tensie has a few requirements you should be aware of:

- Node v12.17.0 and above

## Browser support
Tensei supports reasonably recent versions of the the most popular browsers:

- Google Chrome
- Apple Safari
- Microsoft Edge
- Mozilla Firefox

The administration dashboard is built with [React.js](https://reactjs.org/docs/react-dom.html#browser-support), so browser support would almost always depend on React.

## Package installation via npm
Tensei is shipped as a free npm package. To install it, run the follow command:

```bash
yarn add @tensei/core

// npm
npm install @tensei/core
```

## Setup a basic application
Tensei is a wrapper around [express](https://expressjs.com/). Behind the scenes, it creates an Express application, adds routes, middleware, and functionality, and gives you back the express instance. Here's a simple example starter:

```js
const { tensei } = require('@tensei/core')

tensei()
    .register()
    .then(({ app }) => {

        // app is an Express() instance. Now you can do whatever you need with it,
        // such as app.get(), app.post() etc
        app.listen(4000, () => {
            console.log('App listening on port http://localhost:4000')
        })
    })
```

The `tensei()` method returns a `Tensei` instance. The `register()` method connects to the database, sets up the routes and controllers, and resolves with a promise that returns the same `Tensei` instance.
