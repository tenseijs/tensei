// import { Resource as ResourceInterface } from '../typings/interfaces'
import Pluralize from 'pluralize'
import Field from '../fields/Field'
import { paramCase, capitalCase } from 'change-case'
import { DatabaseRepository } from 'server/typings/interfaces'
import Repository from 'server/database/Repository'
import { validateAll } from 'indicative/validator'
import { ValidationError } from '../controllers/Controller'

export class Resource {
    /**
     *
     * The private database instance. This will be
     * used to perform operations on the
     * resource.
     */
    private $db: Repository

    /**
     *
     * The model instance for this resource
     *
     */
    private $model: null | {} = null

    /**
     *
     * Instantiate resource with the model
     */
    public constructor($db: Repository) {
        this.$db = $db
    }

    /**
     * This would match a model, which is a
     * database row or collection
     * item
     */
    public model(model: {}) {
        this.$model = model

        return this
    }

    /**
     * This is the collection this resource will connect to
     * By default, it is the plural of the lower
     * case of the collection name.
     */
    public collection(): string {
        return Pluralize(paramCase(this.name()))
    }

    /**
     *
     * This is the primary key to be used to identify the resource
     * When resources are selected on the panel for example,
     * the primary key is used to identify them.
     */
    public primaryKey(): string {
        return '_id'
    }

    /**
     *
     * Use this to group resources on the left sidebar.
     * By default all resources are
     * in the `All` group
     */
    public group(): string {
        return 'All'
    }

    /**
     *
     * Define all the options for items to be fetched per page.
     * This would impact the number of items fetched on
     * page load.
     */
    public perPageOptions(): Array<number> {
        return [10, 25, 50, 100]
    }

    /**
     *
     * Determine if a resource should show up
     * on the left navigation.
     */
    public displayInNavigation(): boolean {
        return true
    }

    /**
     *
     * Get the name of the resource.
     */
    public name(): string {
        return this.constructor.name
    }

    /**
     *
     * This is the displayable label of the resource
     * It will appear on the left navigation
     * bar
     */
    public label(): string {
        return capitalCase(Pluralize(this.name()))
    }

    /**
     *
     * Define all the fields for this resource.
     * This array will be serialised and
     * sent to the frontend
     *
     */
    public fields(): Array<any> {
        return []
    }

    /**
     *
     * This will be used as the route param for
     * /resources/:param or /resuces/param
     */
    private param(): string {
        return Pluralize(paramCase(this.name()))
    }

    /**
     *
     * Set the custom validation messages for the
     * validation rules.
     */
    public messages(): {
        [key: string]: string
    } {
        return {}
    }

    /**
     * Serialize the resource to be sent to
     * the frontend
     *
     */
    public serialize(): {
        name: string
        label: string
        group: string
        param: string
        primaryKey: string
        collection: string
        fields: Array<any>
        displayInNavigation: boolean
        perPageOptions: Array<number>
        messages: { [key: string]: string }
    } {
        return {
            name: this.name(),
            label: this.label(),
            group: this.group(),
            param: this.param(),
            messages: this.messages(),
            primaryKey: this.primaryKey(),
            collection: this.collection(),
            perPageOptions: this.perPageOptions(),
            displayInNavigation: this.displayInNavigation(),
            fields: this.fields().map((field) => field.serialize()),
        }
    }

    public create = (data: any = this.$model) => {
        return this.$db.insertOne(this.collection(), data)
    }

    public findAll = (query = {}) => {
        return this.$db.findAll(this.collection(), query)
    }

    public parseQueryParameters = async (params: {} = {}) => {
        const query: any = {}

        let errors: ValidationError[] = []
        const operators: {
            [key: string]: {
                key: string
                value: string
                validator?: (
                    value: any,
                    field: string
                ) => Promise<[boolean, any, ValidationError[] | null]>
            }
        } = {
            $in: {
                key: '_in',
                value: '$in',
                validator: this.validate$nin,
            },
            $lt: {
                key: '_lt',
                value: '$lt',
                validator: this.validate$lt,
            },
            $nin: {
                key: '_nin',
                value: '$nin',
                validator: this.validate$nin,
            },
            $ne: {
                key: '_ne',
                value: '$ne',
            },
            $gt: {
                key: '_gt',
                value: '$gt',
                validator: this.validate$lt,
            },
            $lte: {
                key: '_lte',
                value: '$lte',
                validator: this.validate$lt,
            },
            $gte: {
                key: '_gte',
                value: '$gte',
                validator: this.validate$lt,
            },
        }

        Object.keys(params).forEach((param) => {
            Object.keys(operators).forEach((operatorKey) => {
                const operator = operators[operatorKey]
                if (param.match(operator.key)) {
                    const field = param.split(operator.key)[0]

                    query[field] = {
                        ...(query[field] || {}),
                        [operator.value]: (params as any)[param],
                    }
                }
            })
        })

        // VALIDATE QUERY PARAMETERS, RETURN ERRORS, OR RETURN CORRECTLY FORMATTED QUERY
        // { _id: {}, title: {}, book: {} }
        const queryFields = Object.keys(query)

        const fields = this.serialize().fields.map((field) => field.inputName)

        queryFields.forEach((field) => {
            if (!fields.includes(field)) {
                errors = [
                    ...errors,
                    {
                        message: `The ${field} field is not a valid field in the ${this.collection()} resource.`,
                        field,
                    },
                ]
            }
        })

        for (let index = 0; index < queryFields.length; index++) {
            const field = queryFields[index]

            const fieldOperators = Object.keys(query[field])

            for (let index = 0; index < fieldOperators.length; index++) {
                const operatorName = fieldOperators[index]

                const validator = operators[operatorName].validator

                if (validator) {
                    const [
                        succesful,
                        transformedValue = null,
                        validatorErrors,
                    ] = await validator(query[field][operatorName], field)

                    if (
                        !succesful &&
                        validatorErrors &&
                        Array.isArray(validatorErrors)
                    ) {
                        errors = [...errors, ...validatorErrors]
                    }
                }
            }
        }

        // get all names of fields
        // loop through all query params
        // if query param is not a valid field, save an array of errors.

        return [errors.length === 0, query, errors]
    }

    private validate$nin = async (
        value: any,
        field: string
    ): Promise<[boolean, any, ValidationError[] | null]> => {
        const parsedValue = Array.isArray(value) ? value : [value]

        try {
            await validateAll(
                {
                    [field]: parsedValue,
                },
                {
                    [field]: 'required|array',
                    [`${field}.*`]: 'string',
                },
                {
                    [`${field}.*`]: 'This field is not a valid array of strings.',
                }
            )

            return [true, parsedValue, null]
        } catch (errors) {
            return [false, null, errors]
        }
    }

    private validate$lt = async (
        value: any,
        field: string
    ): Promise<[boolean, any, ValidationError[] | null]> => {
        try {
            await validateAll(
                {
                    [field]: value,
                },
                {
                    [field]: 'required|float',
                },
                {
                    [`${field}.float`]: 'This field is not a valid floating number.',
                }
            )

            return [true, parseFloat(value), null]
        } catch (errors) {
            return [false, null, errors]
        }
    }
}

export default Resource
