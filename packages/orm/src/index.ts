import Fs from 'fs'
import Path from 'path'
import Prettier from 'prettier'
import { EntityManager } from '@mikro-orm/core'
import { ResourceContract } from '@tensei/common'

import { resolveFieldTypescriptType } from './helpers'

export class Orm {
  constructor(
    public resources: ResourceContract[],
    public manager: EntityManager
  ) {}

  public generate() {
    const repositories: any = {}

    this.resources.forEach(resource => {
      repositories[
        resource.data.camelCaseNamePlural
      ] = this.manager.getRepository(resource.data.pascalCaseName)

      resource.data.methods.forEach(method => {
        const methodName = method.name.replace(/\s+/g, '')

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
            ${this.resources
              .map(resource => {
                return `export interface ${resource.data.pascalCaseName}Model {
                    ${resource.data.fields.map(
                      field =>
                        `${field.databaseField}: ${resolveFieldTypescriptType(
                          field,
                          this.resources
                        )}`
                    )}\n
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
                ${this.resources.map(resource => {
                  return `${resource.data.camelCaseNamePlural}: ${resource.data.pascalCaseName}Repository`
                })}
            }
        }
    `
  }
}
