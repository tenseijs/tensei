import { Config } from '@tensei/common'
import {
    MikroORM,
    EntitySchema,
    ReferenceType,
    EntityMetadata
} from '@mikro-orm/core'

import { FieldContract } from '@tensei/common'
import { ResourceContract } from '@tensei/common'
import BaseEntitySchema, { BaseEntity } from './BaseEntity'

import Migrator from './Migrator'

class Database {
    public orm: MikroORM | null = null
    public initialized: boolean = false

    public schemas: any = []
    constructor(public config: Config) {}

    async init() {
        if (this.initialized) {
            return [this.orm!, this.schemas]
        }

        this.orm = await MikroORM.init(this.getMikroORMOptions())

        await new Migrator(this.orm!, this.schemas).init()

        return [this.orm!, this.schemas]
    }

    getMikroORMOptions() {
        return {
            entities: [BaseEntity, ...this.generateEntitySchemas()],
            ...this.config.databaseConfig
        }
    }

    generateEntitySchemas() {
        this.schemas = this.config.resources.map(resource => {
            let entityMeta: any = {
                name: resource.data.pascalCaseName,
                extends: 'BaseEntity',
                tableName: resource.data.table,
                collection: resource.data.table,
                hooks: {}
            }

            let entityProperties: any = {}

            resource.data.fields.forEach(field => {
                if (field.isRelationshipField) {
                    this.updateFieldRelationshipRelatedProperty(field, resource)
                    entityProperties[field.databaseField] =
                        field.relatedProperty
                } else {
                    entityProperties[field.databaseField] = field.property
                }
            })

            // resource.data.filters.forEach(filter => {
            //     entityProperties.filters = {
            //         ...entityProperties.filters,
            //         [filter.config.shortName]: {
            //             name: filter.config.shortName,
            //             cond: filter.config.cond,
            //             args: filter.config.args,
            //             default: filter.config.default
            //         }
            //     }
            // })

            // onInit = "onInit",
            // beforeCreate = "beforeCreate",
            // afterCreate = "afterCreate",
            // beforeUpdate = "beforeUpdate",
            // afterUpdate = "afterUpdate",
            // beforeDelete = "beforeDelete",
            // afterDelete = "afterDelete",
            // beforeFlush = "beforeFlush",
            // onFlush = "onFlush",
            // afterFlush = "afterFlush"
            entityMeta.hooks.onInit = (...all: any) => {
                console.log('@@@@@@@@@ INIT', all)
            }

            entityMeta.properties = entityProperties

            return entityMeta
        })

        return this.schemas.map((schema: any) => new EntitySchema(schema))
    }

    private updateFieldRelationshipRelatedProperty(
        field: FieldContract,
        resource: ResourceContract
    ) {
        if (field.relatedProperty.reference === ReferenceType.MANY_TO_MANY) {
            const relatedResource = this.config.resourcesMap[
                field.relatedProperty.type!
            ]

            if (!relatedResource) {
                this.config.logger.warn(
                    `Resource not found with name ${field.relatedProperty.type}. Did you define your belongs to many relationship on ${resource.data.name} correctly ?`
                )
            } else {
                const relatedField = relatedResource.data.fields.find(
                    f =>
                        f.isRelationshipField &&
                        f.relatedProperty.type ===
                            resource.data.pascalCaseName &&
                        f.relatedProperty.reference ===
                            ReferenceType.MANY_TO_MANY
                )

                if (!relatedField) {
                    return
                }

                if (!relatedField.relatedProperty.owner) {
                    field.relatedProperty.owner = true
                    field.relatedProperty.inversedBy =
                        relatedField.databaseField

                    relatedField.relatedProperty.owner = false
                    relatedField.relatedProperty.mappedBy = field.databaseField
                }
            }
        }

        if (field.relatedProperty.reference === ReferenceType.MANY_TO_ONE) {
            const relatedResource = this.config.resourcesMap[
                field.relatedProperty.type!
            ]

            if (!relatedResource) {
                this.config.logger.warn(
                    `Resource not found with name ${field.relatedProperty.type}. Did you define your belongs to relationship on ${resource.data.name} correctly ?`
                )
            } else {
                const relatedField = relatedResource.data.fields.find(
                    f =>
                        f.isRelationshipField &&
                        f.relatedProperty.type ===
                            resource.data.pascalCaseName &&
                        f.relatedProperty.reference ===
                            ReferenceType.ONE_TO_MANY
                )

                if (!relatedField) {
                    return
                }

                if (!relatedField.relatedProperty.owner) {
                    field.relatedProperty.inversedBy =
                        relatedField.databaseField
                }
            }
        }

        if (field.relatedProperty.reference === ReferenceType.ONE_TO_MANY) {
            const relatedResource = this.config.resourcesMap[
                field.relatedProperty.type!
            ]

            if (!relatedResource) {
                this.config.logger.warn(
                    `Resource not found with name ${field.relatedProperty.type}. Did you define your has many relationship on ${resource.data.name} correctly ?`
                )
            } else {
                const relatedField = relatedResource.data.fields.find(
                    f =>
                        f.isRelationshipField &&
                        f.relatedProperty.type ===
                            resource.data.pascalCaseName &&
                        f.relatedProperty.reference ===
                            ReferenceType.MANY_TO_ONE
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
            const relatedResource = this.config.resourcesMap[
                field.relatedProperty.type!
            ]

            if (!relatedResource) {
                this.config.logger.warn(
                    `Resource not found with name ${field.relatedProperty.type}. Did you define your has one relationship on ${resource.data.name} correctly ?`
                )
            } else {
                const relatedField = relatedResource.data.fields.find(
                    f =>
                        f.isRelationshipField &&
                        f.relatedProperty.type ===
                            resource.data.pascalCaseName &&
                        f.relatedProperty.reference === ReferenceType.ONE_TO_ONE
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

        return field
    }
}

export default Database
