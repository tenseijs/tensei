import Field from '../fields/Field'
import Resource from '../resources/Resource'
import { validateAll } from 'indicative/validator'

export interface ValidationError {
    message: string
    field: string
}

class Controller {
    findResource = (param: string, resources: Array<Resource>) => {
        return resources.find(
            (resource) => resource.serialize().param === param
        )
    }

    getValidationRules = (resource: Resource, creationRules = true) => {
        const fields: Array<any> = resource.fields()

        const rules: {
            [key: string]: string
        } = {}

        fields.forEach((field) => {
            const serializedField = field.serialize()

            const fieldValidationRules = Array.from(
                new Set([
                    ...serializedField.rules,
                    ...serializedField[
                        creationRules ? 'creationRules' : 'updateRules'
                    ],
                ])
            ).join('|')

            if (fieldValidationRules) {
                rules[serializedField.inputName] = fieldValidationRules
            }

            if (field.component === 'ObjectField') {
                serializedField.fields.forEach((childField: any) => {
                    rules[
                        `${serializedField.inputName}.${childField.inputName}`
                    ] = Array.from(
                        new Set([
                            ...childField.rules,
                            ...childField[
                                creationRules ? 'creationRules' : 'updateRules'
                            ],
                        ])
                    ).join('|')
                })
            }
        })

        return rules
    }

    validate = async (
        data: any,
        resource: Resource
    ): Promise<
        [
            boolean,
            {
                [key: string]:
                    | string
                    | {
                          [key: string]: string
                      }
            } | null
        ]
    > => {
        try {
            const validationRules = this.getValidationRules(resource)

            await validateAll(
                data,
                validationRules,
                resource.serialize().messages
            )

            return [false, null]
        } catch (errors) {
            return [true, this.formatValidationErrors(errors)]
        }
    }

    protected formatValidationErrors = (
        errors: Array<ValidationError>
    ): {
        [key: string]:
            | string
            | {
                  [key: string]: string
              }
    } => {
        const formattedErrors: {
            [key: string]:
                | string
                | {
                      [key: string]: string
                  }
        } = {}

        errors.forEach((error) => {
            if (error.field.indexOf('.') !== -1) {
                const [objectField, nestedField] = error.field.split('.')

                formattedErrors[objectField] = {
                    ...((formattedErrors[objectField] || {}) as {}),
                    [nestedField]: error.message,
                }
            } else {
                formattedErrors[error.field] = error.message
            }
        })

        return formattedErrors
    }
}

export default Controller
