import Fs from 'fs'
import Path from 'path'
import chalk from 'chalk'
import Execa from 'execa'
import Edge from 'edge.js'
import latestVersion from 'latest-version'

export const getAvailableTemplates = () => ['quickstart']

export const getAvailableDatabases = () => ['sqlite', 'mysql', 'postgresql']

export const getPackageVersions = (database: string, api: string) =>
    Promise.all([
        latestVersion(`@mikro-orm/${database}`),
        latestVersion(`@tensei/core`),
        latestVersion(`@tensei/auth`),
        latestVersion(`@tensei/${api}`),
        latestVersion(`nodemon`)
    ])

export const parseTemplateFiles = (
    template: string,
    templateVariables: any
) => {
    const basePath = Path.resolve(__dirname, '..', '..', 'templates', template)

    return Fs.readdirSync(basePath).map(file => [
        file,
        Edge.renderString(
            Fs.readFileSync(Path.resolve(basePath, file)).toString(),
            templateVariables
        )
    ])
}

export const projectDirectoryExists = (project: string) =>
    Fs.existsSync(Path.resolve(process.cwd(), project))

export const createProjectFolder = (project: string) =>
    Fs.mkdirSync(Path.resolve(process.cwd(), project))

export const createProjectFile = (
    project: string,
    file: string,
    content: string
) =>
    Fs.writeFileSync(
        Path.resolve(
            process.cwd(),
            project,
            file.endsWith('.edge') ? file.substring(0, file.length - 5) : file
        ),
        content
    )

export const hasYarnInstalled = () => {
    try {
        return Execa.commandSync('yarn --version').exitCode === 0
    } catch (e) {
        return false
    }
}

export const installProjectDependencies = (
    packageManager: string,
    project: string
) =>
    Execa.sync(packageManager, ['install'], {
        cwd: Path.resolve(process.cwd(), project),
        stdin: 'ignore',
        shell: true
    })

export const style = {
    error: chalk.bold.red,
    warning: chalk.keyword('orange'),
    success: chalk.greenBright,
    info: chalk.grey,

    header: chalk.bold.underline.hex('#e8e8e8'),
    cmd: chalk.hex('#808080'),
    tensei: chalk.hex('#56b3e2'),
    love: chalk.redBright,

    green: chalk.green
}
