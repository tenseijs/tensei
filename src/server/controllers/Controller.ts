import Field from '../fields/Field'
import Resource from '../resources/Resource'
import { validateAll } from 'indicative/validator'

interface ValidationError {
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
        const fields: Array<Field> = resource.fields()

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
        })

        return rules
    }

    protected validate = async (
        data: any,
        resource: Resource
    ): Promise<
        [
            boolean,
            {
                [key: string]: string
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
        [key: string]: string
    } => {
        const formattedErrors: {
            [key: string]: string
        } = {}

        errors.forEach((error) => {
            formattedErrors[error.field] = error.message
        })

        return formattedErrors
    }
}

export default Controller
