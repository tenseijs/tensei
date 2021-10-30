import Fs from 'fs'
import Path from 'path'
import Prettier from 'prettier'
import { Config } from '@tensei/common'

import { resolveFieldTypescriptType } from './helpers'

export class Orm {
  constructor(public ctx: Config) {}

  private cachedRepositories: any = {}

  public generate() {
    const repositories: any = {}

    const self = this

    this.ctx.resources.forEach(resource => {
      repositories[resource.data.camelCaseNamePlural] = function () {
        if (self.cachedRepositories[resource.data.camelCaseNamePlural]) {
          return self.cachedRepositories[resource.data.camelCaseNamePlural]
        }

        const repository = (
          self.ctx.request?.manager || self.ctx.orm!.em
        ).getRepository(resource.data.pascalCaseName)

        resource.data.repositoryMethods.forEach(method => {
          const methodName = method.name.replace(/\s+/g, '')

          ;(repository as any)[methodName] = method.fn.bind(repository)
        })

        self.cachedRepositories[resource.data.camelCaseNamePlural] = repository

        return repository
      }

      Object.defineProperty(
        repositories[resource.data.camelCaseNamePlural],
        'name',
        {
          value: `${resource.data.pascalCaseName}Repository`
        }
      )
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
                  return `${resource.data.camelCaseNamePlural}: () => ${resource.data.pascalCaseName}Repository`
                })}
            }
        }
    `
  }
}
