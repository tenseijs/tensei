import { MikroORM, EntitySchema, ReferenceType } from '@mikro-orm/core'
import { FieldContract, ResourceContract, Config } from '@tensei/common'

import Migrator from './Migrator'

const hookNames: (keyof ResourceContract['hooks'])[] = [
  'onInit',
  'beforeCreate',
  'afterCreate',
  'beforeUpdate',
  'afterUpdate',
  'beforeDelete',
  'afterDelete',
  'beforeFlush',
  'onFlush',
  'afterFlush'
]

class Database {
  public orm: MikroORM | null = null
  public initialized: boolean = false

  public schemas: any = []
  constructor(public config: Config) {}

  async init() {
    if (this.initialized) {
      return [this.orm!, this.schemas]
    }

    this.orm = await MikroORM.init(this.getMikroORMOptions() as any)

    await new Migrator(this.orm!, this.schemas).init()

    return [this.orm!, this.schemas]
  }

  getMikroORMOptions() {
    const { entities, ...rest } = this.config.databaseConfig

    return {
      entities: [
        ...this.generateEntitySchemas(),
        ...(entities || []).map((_: any) => new EntitySchema(_))
      ],
      ...rest
    }
  }

  generateEntitySchemas() {
    const databaseType = this.config.databaseConfig.type

    this.schemas = this.config.resources.map(resource => {
      let entityMeta: any = {
        name: resource.data.pascalCaseName,
        // extends: 'BaseEntity',
        tableName: resource.data.table,
        collection: resource.data.table,
        hooks: {}
      }

      let entityProperties: any = {}

      resource.data.fields.forEach(field => {
        if (field.isRelationshipField) {
          this.updateFieldRelationshipRelatedProperty(field, resource)
          entityProperties[field.databaseField] = {
            ...field.property,
            ...field.relatedProperty
          }
        } else {
          if (field.databaseField === 'id' && databaseType === 'mongo') {
            entityProperties._id = {
              // ...field.property,
              type: 'ObjectId',
              primary: true
            }

            entityProperties.id = {
              // ...field.property,
              type: 'string',
              serializedPrimaryKey: true
            }
          } else {
            entityProperties[field.databaseField] = field.property
          }
        }
      })

      entityMeta.hooks.onInit = entityMeta.hooks.onInit = ['onInit']

      hookNames.forEach(hookName => {
        entityMeta.hooks[hookName] = [hookName]
      })

      entityMeta.properties = entityProperties

      entityMeta.class = this.generateEntityClass(resource)

      return entityMeta
    })

    return this.schemas.map((schema: any) => new EntitySchema(schema))
  }

  private generateEntityClass(resource: ResourceContract) {
    const entityClass = function () {}

    const config = this.config

    Object.defineProperty(entityClass, 'name', {
      value: resource.data.pascalCaseName,
      writable: false
    })

    // Set model methods on class
    resource.data.methods.forEach(method => {
      entityClass.prototype[method.name] = function (...fnArgs: any) {
        this.ctx = config // Set the config on the value of this
        this.ctx.manager = config.orm?.em.fork()
        this.repositories = config.repositories // Set the repositories on the value of this
        const fn = method.fn.bind(this)

        return fn(...fnArgs)
      }
    })

    hookNames.forEach(hookName => {
      entityClass.prototype[hookName] = (eventPayload: any) =>
        Promise.all(
          (resource.hooks[hookName] as any).map((fn: any) =>
            fn(eventPayload, config)
          )
        )
    })

    // Generate entity class getters (for virtual properties)
    resource.data.fields
      .filter(field => field.property.persist === false)
      .forEach(field => {
        Object.defineProperty(entityClass.prototype, field.databaseField, {
          get: function (this: any, value: any) {
            const fn = field.property.virtualGetter?.bind(this)

            return fn?.(value)
          } as any
        })
      })

    return entityClass
  }

  private updateFieldRelationshipRelatedProperty(
    field: FieldContract,
    resource: ResourceContract
  ) {
    if (field.relatedProperty.reference === ReferenceType.MANY_TO_MANY) {
      const relatedResource =
        this.config.resourcesMap[field.relatedProperty.type!]

      if (!relatedResource) {
        this.config.logger.warn(
          `Resource not found with name ${field.relatedProperty.type}. Did you define your belongs to many relationship on ${resource.data.name} correctly ?`
        )
      } else {
        const relatedField = relatedResource.data.fields.find(
          f =>
            f.isRelationshipField &&
            f.relatedProperty.type === resource.data.pascalCaseName &&
            f.relatedProperty.reference === ReferenceType.MANY_TO_MANY
        )

        if (!relatedField) {
          return
        }

        if (!relatedField.relatedProperty.owner) {
          field.relatedProperty.owner = true
          field.relatedProperty.inversedBy = relatedField.databaseField

          relatedField.relatedProperty.owner = false
          relatedField.relatedProperty.mappedBy = field.databaseField
        }
      }
    }

    if (field.relatedProperty.reference === ReferenceType.MANY_TO_ONE) {
      const relatedResource =
        this.config.resourcesMap[field.relatedProperty.type!]

      if (!relatedResource) {
        this.config.logger.warn(
          `Resource not found with name ${field.relatedProperty.type}. Did you define your belongs to relationship on ${resource.data.name} correctly ?`
        )
      } else {
        const relatedField = relatedResource.data.fields.find(
          f =>
            f.isRelationshipField &&
            f.relatedProperty.type === resource.data.pascalCaseName &&
            f.relatedProperty.reference === ReferenceType.ONE_TO_MANY
        )

        if (!relatedField) {
          return
        }

        if (!relatedField.relatedProperty.owner) {
          field.relatedProperty.inversedBy = relatedField.databaseField
        }
      }
    }

    if (field.relatedProperty.reference === ReferenceType.ONE_TO_MANY) {
      const relatedResource =
        this.config.resourcesMap[field.relatedProperty.type!]

      if (!relatedResource) {
        this.config.logger.warn(
          `Resource not found with name ${field.relatedProperty.type}. Did you define your has many relationship on ${resource.data.name} correctly ?`
        )
      } else {
        const relatedField = relatedResource.data.fields.find(
          f =>
            f.isRelationshipField &&
            f.relatedProperty.type === resource.data.pascalCaseName &&
            f.relatedProperty.reference === ReferenceType.MANY_TO_ONE
        )

        if (!relatedField) {
          return
        }

        if (!relatedField.relatedProperty.owner) {
          field.relatedProperty.owner = true
          field.relatedProperty.mappedBy = relatedField.databaseField
        }
      }
    }

    if (field.relatedProperty.reference === ReferenceType.ONE_TO_ONE) {
      const relatedResource =
        this.config.resourcesMap[field.relatedProperty.type!]

      if (!relatedResource) {
        this.config.logger.warn(
          `Resource not found with name ${field.relatedProperty.type}. Did you define your has one relationship on ${resource.data.name} correctly ?`
        )
      } else {
        const relatedField = relatedResource.data.fields.find(
          f =>
            f.isRelationshipField &&
            f.relatedProperty.type === resource.data.pascalCaseName &&
            f.relatedProperty.reference === ReferenceType.ONE_TO_ONE
        )

        if (!relatedField) {
          return
        }

        if (!relatedField.relatedProperty.owner) {
          field.relatedProperty.owner = true

          relatedField.relatedProperty.inversedBy = field.databaseField
        }
      }
    }

    return field
  }
}

export default Database
