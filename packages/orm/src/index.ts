import Fs from 'fs'
import Path from 'path'
import Prettier from 'prettier'
import { Config } from '@tensei/common'

import { resolveFieldTypescriptType } from './helpers'

export class Orm {
  constructor(public ctx: Config) {}

  public generate() {
    const repositories: any = {}

    this.ctx.resources.forEach(resource => {
      repositories[
        resource.data.camelCaseNamePlural
      ] = this.ctx.orm?.em.getRepository(resource.data.pascalCaseName)

      resource.data.repositoryMethods.forEach(method => {
        const methodName = method.name.replace(/\s+/g, '')

        const ctx = this.ctx

        // Set ctx property on repository instance
        repositories[resource.data.camelCaseNamePlural]['ctx'] = ctx
        repositories[resource.data.camelCaseNamePlural]['repositories'] =
          ctx.repositories

        repositories[resource.data.camelCaseNamePlural][
          methodName
        ] = method.fn.bind(repositories[resource.data.camelCaseNamePlural])
      })
    })

    return repositories
  }

  public generateTypes() {
    const types = Prettier.format(this.generateRepositoryInterfaces(), {
      semi: false,
      parser: 'typescript',
      singleQuote: true
    })

    Fs.writeFileSync(Path.resolve(__dirname, 'index.d.ts'), types)
  }

  private generateRepositoryInterfaces() {
    return `
        declare module '@tensei/orm' {
            import { EntityRepository } from '@mikro-orm/core'
            ${this.ctx.resources
              .map(resource => {
                return `export interface ${resource.data.pascalCaseName}Model {
                    ${resource.data.fields.map(
                      field =>
                        `${field.databaseField}: ${resolveFieldTypescriptType(
                          field,
                          this.ctx.resources
                        )}`
                    )}\n
                    repositories: OrmContract
                }\n
                export interface ${
                  resource.data.pascalCaseName
                }Repository extends EntityRepository<${
                  resource.data.pascalCaseName
                }Model> {}\n
                `
              })
              .join('\n')}
            export interface OrmContract {
                ${this.ctx.resources.map(resource => {
                  return `${resource.data.camelCaseNamePlural}: ${resource.data.pascalCaseName}Repository`
                })}
            }
        }
    `
  }
}
