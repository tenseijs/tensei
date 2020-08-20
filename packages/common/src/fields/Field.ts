import { snakeCase, camelCase } from 'change-case'
import { FieldHookFunction } from '../config'

interface Constructor<M> {
    new (...args: any[]): M
}

export interface SerializedField {
    name: string
    component: string
    inputName: string
    isSortable: boolean
    description: string
    rules: string[]
    defaultValue: string
    isNullable: boolean
    isUnique: boolean
    isSearchable: boolean
    showOnIndex: boolean
    showOnDetail: boolean
    showOnUpdate: boolean
    showOnCreation: boolean
    updateRules: string[]
    creationRules: string[]
    hidden: boolean
    fieldName: string
    camelCaseName: string
    databaseField: string
    sqlDatabaseFieldType: string | undefined
    attributes: { [key: string]: string }
    selectOptions?: {
        label: string
        value: string
    }[]
    defaultToNow?: boolean
    isUnsigned?: boolean
    isRelationshipField: boolean
}

export class Field {
    public showHideField = {
        /**
         *
         * If this is true, the field will be shown on the
         * index page
         *
         */
        showOnIndex: true,

        /**
         *
         * If this is true, the field will be updatable. It will
         * show up on the update page
         *
         */
        showOnUpdate: true,

        /**
         *
         * If this is true, the field will show up on the detail page
         */
        showOnDetail: true,

        /**
         *
         * If this is true, the field will be shown on the creation
         * form
         */
        showOnCreation: true,
    }

    public hooks: {
        beforeCreate: FieldHookFunction
        beforeUpdate: FieldHookFunction
        afterCreate: FieldHookFunction
        afterUpdate: FieldHookFunction
    } = {
        beforeCreate: (payload, request) => {
            return payload
        },

        beforeUpdate: (payload, request) => {
            return payload
        },

        afterCreate: (payload, request) => {
            return payload
        },

        afterUpdate: (payload, request) => {
            return payload
        },
    }

    public beforeCreate(hook: FieldHookFunction) {
        this.hooks = {
            ...this.hooks,
            beforeCreate: hook,
        }

        return this
    }

    public beforeUpdate(hook: FieldHookFunction) {
        this.hooks = {
            ...this.hooks,
            beforeUpdate: hook,
        }

        return this
    }

    public afterCreate(hook: FieldHookFunction) {
        this.hooks = {
            ...this.hooks,
            afterCreate: hook,
        }

        return this
    }

    public afterUpdate(hook: FieldHookFunction) {
        this.hooks = {
            ...this.hooks,
            afterUpdate: hook,
        }

        return this
    }

    /**
     *
     * The name of the field. Will be used to display table columns,
     * field labels etc
     */
    public name: string

    protected sqlDatabaseFieldType: string | undefined = undefined

    /**
     *
     * Define validation rules to be used to validate
     * this field on forms
     */
    public validationRules: Array<string> = []

    /**
     *
     * Define validation rules to be used to validate
     * this field on creation forms
     */
    public creationValidationRules: Array<string> = []

    /**
     *
     * Define validation rules to be used to validate
     * this field on update forms
     */
    public updateValidationRules: Array<string> = []

    /**
     *
     * This is a set of all html attributes to be passed
     * to this component
     *
     */
    public attributes: {} = {}

    /**
     * 
     * This value set to true will hide this field completely
     * from all query results.
     */
    public isHidden: boolean = false

    protected isRelationshipField: boolean = false

    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component: string = `${this.constructor.name}Field`

    /**
     *
     * The database field associated with this field.
     * By default, this will be the camel case
     * version of the name
     *
     */
    public databaseField: string

    /**
     *
     * The
     */
    public helpText: string = ''

    public isNullable: boolean = true

    public isUnique: boolean = false

    /**
     *
     * Adds database sorting by this field. Will show up
     * on the index page, on the table headers.
     *
     */
    public isSortable: boolean = false

    public isSearchable: boolean = false

    /**
     *
     * Set the default value of this
     * field
     *
     */
    public defaultValue: string = ''

    /**
     * Instantiate a new field. Requires the name,
     * and optionally the corresponding database
     * field. This field if not provided will
     * default to the camel case version of
     * the name.
     */
    public constructor(name: string, databaseField?: string) {
        this.name = name

        this.databaseField = databaseField || snakeCase(this.name)
    }

    /**
     *
     * Show this field on the index page
     */
    public showOnIndex(): Field {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: true,
        }

        return this
    }

    /**
     *
     * Show this field on the detail page
     */
    public showOnDetail(): Field {
        this.showHideField = {
            ...this.showHideField,
            showOnDetail: true,
        }

        return this
    }

    /**
     *
     * Show this field on the creation page
     */
    public showOnCreation(): Field {
        this.showHideField = {
            ...this.showHideField,
            showOnCreation: true,
        }

        return this
    }

    /**
     *
     * Show this field on the update page
     */
    public showOnUpdate(): Field {
        this.showHideField = {
            ...this.showHideField,
            showOnUpdate: true,
        }

        return this
    }

    /**
     *
     * Hide this field on the index page
     */
    public hideFromIndex(): Field {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: false,
        }

        return this
    }

    /**
     *
     * Hide this field from the detail page
     */
    public hideFromDetail(): Field {
        this.showHideField = {
            ...this.showHideField,
            showOnDetail: false,
        }

        return this
    }

    /**
     *
     * Hide this field from the create form
     */
    public hideWhenCreating(): Field {
        this.showHideField = {
            ...this.showHideField,
            showOnCreation: false,
        }

        return this
    }

    /**
     *
     * Hide this field from the update form
     */
    public hideWhenUpdating(): Field {
        this.showHideField = {
            ...this.showHideField,
            showOnUpdate: false,
        }

        return this
    }

    /**
     *
     * Hide this field everywhere, except the index page
     */
    public onlyOnIndex(): Field {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: true,
            showOnUpdate: false,
            showOnCreation: false,
            showOnDetail: false,
        }

        return this
    }

    /**
     *
     * Hide this field everuwhere, except the
     * create and update forms
     */
    public onlyOnForms(): Field {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: false,
            showOnUpdate: true,
            showOnCreation: true,
            showOnDetail: false,
        }

        return this
    }

    /**
     *
     * Show this field only on the detail and,
     * index pages. hidden on create and
     * update forms.
     */
    public exceptOnForms(): Field {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: true,
            showOnUpdate: false,
            showOnCreation: false,
            showOnDetail: true,
        }

        return this
    }

    /**
     * Create a new instance of the field
     * requires constructor parameters
     *
     */
    public static make<T extends Field>(
        this: Constructor<T>,
        name: string,
        databaseField?: string
    ): T {
        return new this(name, databaseField)
    }

    /**
     *
     * Make this field sortable
     *
     */
    public sortable<T extends Field>(this: T): T {
        this.isSortable = true

        return this
    }

    /**
     *
     * Make this field searchable. will also index
     * this field in the database.
     *
     */
    public searchable<T extends Field>(this: T): T {
        this.isSearchable = true

        return this
    }

    /**
     *
     * Make this field sortable
     *
     */
    public unique<T extends Field>(this: T): T {
        this.isUnique = true

        return this
    }

    /**
     *
     * Make this field nullable
     *
     */
    public notNullable<T extends Field>(this: T): T {
        this.isNullable = false

        return this
    }

    /**
     *
     * Define the description. This would be a help text
     * that provides more information to the user
     * about this field on forms.
     */
    public description<T extends Field>(this: T, description: string): T {
        this.helpText = description

        return this
    }

    /**
     *
     * Set the default value for this field.
     * Will show up on create forms as
     * default
     *
     */
    public default<T extends Field>(this: T, value: string): T {
        this.defaultValue = value

        return this
    }

    /**
     *
     * Set html attributes for this component
     */
    public htmlAttributes<T extends Field>(this: T, attributes: {}): T {
        this.attributes = attributes

        return this
    }

    /**
     *
     * @param this
     */
    public rules<T extends Field>(this: T, ...rules: Array<string>): T {
        this.validationRules = rules

        return this
    }

    /**
     * Set the validation rules to be used when
     * creating this field to the database
     */
    public creationRules<T extends Field>(this: T, ...rules: Array<string>): T {
        this.creationValidationRules = rules

        return this
    }

    /**
     * Set the validation rules to be used when updating
     * this field
     */
    public updateRules<T extends Field>(this: T, ...rules: Array<string>): T {
        this.updateValidationRules = rules

        return this
    }

    /**
     * Set this field to be a hidden field. It won't show up
     * in query results.
     */
    public hidden<T extends Field>(this: T): T {
        this.isHidden = true

        return this
    }

    /**
     *
     * Serializes the field for data to be sent
     * to the frontend
     *
     */
    public serialize(): SerializedField {
        return {
            ...this.showHideField,

            name: this.name,
            hidden: this.isHidden,
            component: this.component,
            description: this.helpText,
            isNullable: this.isNullable,
            isSortable: this.isSortable,
            isUnique: this.isUnique,
            isSearchable: this.isSearchable,
            attributes: this.attributes,
            rules: this.validationRules,
            inputName: this.databaseField,
            defaultValue: this.defaultValue,
            camelCaseName: camelCase(this.name),
            updateRules: this.updateValidationRules,
            creationRules: this.creationValidationRules,
            fieldName: this.constructor.name,
            databaseField: this.databaseField,
            sqlDatabaseFieldType: this.sqlDatabaseFieldType,
            isRelationshipField: this.isRelationshipField,
        }
    }
}

export default Field
