const Path = require('path')
const Consola = require('consola')
const copyFiles = require('copyfiles')

// Copy the index.mustache template file.
copyFiles(
    [
        Path.resolve('..', 'index.mustache'),
        Path.resolve('..', 'server', 'build', 'index.mustache')
    ],
    error => {
        if (error) {
            Consola.error(error)

            return
        }

        Consola.success('Copied index.mustache file.')
    }
)

console.log(Path.resolve('..', 'server', 'build', 'index.client.js'))

copyFiles(
    [
        Path.resolve('..', '..', 'client/build/index.js'),
        Path.resolve('..', 'server', 'build', 'index.client.js')
    ],
    error => {
        if (error) {
            Consola.error(error)

            return
        }

        Consola.success('Copied client/index.js file.')
    }
)

copyFiles(
    [
        Path.resolve('..', '..', 'client/build/index.css'),
        Path.resolve('..', 'server', 'build', 'index.client.css')
    ],
    error => {
        if (error) {
            Consola.error(error)

            return
        }

        Consola.success('Copied client/index.css file.')
    }
)
