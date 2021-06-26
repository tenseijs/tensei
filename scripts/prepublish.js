const Fs = require('fs')
const Path = require('path')
const Lerna = require('@lerna/version')
const Semver = require('semver')

const packageJson = require('../packages/core/package.json')

// get publish type from args
const publishType = process.argv[2]

// Guess the next version based on publish type and current core version.
const nextVersion = Semver.inc(packageJson.version, publishType)

const templateFolders = Fs.readdirSync('./packages/create-tensei-app/templates')

templateFolders.forEach(templateName => {
    const templatePackageJsonPath = Path.resolve(__dirname, `../packages/create-tensei-app/templates/${templateName}/package.json`)
    const templatePackageJson = require(templatePackageJsonPath)

    Object.keys(templatePackageJson.dependencies).forEach((dep) => {
        if (dep.startsWith('@tensei')) {
            templatePackageJson.dependencies[dep] = `^${nextVersion}`
        }
    })

    Fs.writeFileSync(templatePackageJsonPath, JSON.stringify(templatePackageJson, null, 2))
})

const cliPluginPath = Path.resolve(__dirname, '..', 'packages/cli/_templates/default/new/package.json.ejs.t')

let pluginTemplate = Fs.readFileSync(cliPluginPath).toString()

pluginTemplate.replace(new RegExp(packageJson.version, 'g'), nextVersion)

while(pluginTemplate.includes(packageJson.version)){
    pluginTemplate = pluginTemplate.replace(packageJson.version, nextVersion)
}

Fs.writeFileSync(cliPluginPath, pluginTemplate)

process.exit(0)
