import { Command } from 'commander'
import { snakeCase } from 'change-case'

import Signale from './utils/signale'
import {
    getAvailableTemplates,
    getAvailableDatabases,
    getPackageVersions,
    parseTemplateFiles,
    projectDirectoryExists,
    createProjectFolder,
    createProjectFile,
    hasYarnInstalled,
    installProjectDependencies,
} from './utils/helpers'

export const cli = async (program: Command) => {
    const packageManager = program.npm
        ? 'npm'
        : hasYarnInstalled()
        ? 'yarn'
        : 'npm'

    const project_name = program.args[0]

    const api = program.rest ? 'rest' : 'graphql'
    const database = program.database || 'sqlite'
    const template = program.template || 'quickstart'
    let mikro_orm_db_name = program.dbname || snakeCase(program.args[0])
    const mikro_orm_db_pass = program.dbpassword
    const mikro_orm_db_host = program.dbhost
    const mikro_orm_db_username = program.dbusername

    mikro_orm_db_name = database === 'sqlite' ? `${mikro_orm_db_name}.sqlite` : mikro_orm_db_name

    if (!getAvailableTemplates().includes(template)) {
        Signale.error(`The ${template} template does not exist.`)

        process.exit(1)
    }

    if (!getAvailableDatabases().includes(database)) {
        Signale.error(`The ${template} database is not supported yet.`)

        process.exit(1)
    }

    if (projectDirectoryExists(project_name)) {
        Signale.error(`The directory ${project_name} already exists.`)

        process.exit(1)
    }

    const [
        mikro_orm_package_version,
        core_package_version,
        auth_package_version,
        api_package_version,
        nodemon_version
    ] = await getPackageVersions(database, api)

    const templateVariables = {
        api_package: api,
        project_name,
        mikro_orm_database: database,
        mikro_orm_package_version,
        core_package_version,
        auth_package_version,
        api_package_version,
        nodemon_version,
        mikro_orm_db_name,
        mikro_orm_db_pass,
        mikro_orm_db_host,
        mikro_orm_db_username
    }

    createProjectFolder(project_name)

    parseTemplateFiles(template, templateVariables).map(([file, content]) =>
        createProjectFile(project_name, file, content)
    )

    installProjectDependencies(packageManager, project_name)
}
