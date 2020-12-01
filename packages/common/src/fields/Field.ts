import Pluralize from 'pluralize'
import { snakeCase, camelCase, pascalCase } from 'change-case'
import {
    FieldHookFunction,
    AuthorizeFunction,
    FieldContract,
    SerializedField,
    Config,
    ResourceContract,
    FieldProperty
} from '@tensei/common'

interface Constructor<M> {
    new (...args: any[]): M
}

export class Field implements FieldContract {
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
        showOnCreation: true
    }

    public showHideFieldFromApi = {
        hideFromShowApi: false,
        hideFromCreateApi: false,
        hideFromUpdateApi: false,
        hideFromDeleteApi: false,
        hideFromFetchApi: false
    }

    public property: FieldProperty = {
        name: '',
        type: 'string',
        primary: false
        // nullable: true
    }

    public relatedProperty: FieldProperty = {}

    public tenseiConfig: Config | null = null
    public authorizeCallbacks: {
        authorizedToSee: AuthorizeFunction
        authorizedToCreate: AuthorizeFunction
        authorizedToUpdate: AuthorizeFunction
        authorizedToDelete: AuthorizeFunction
    } = {
        authorizedToSee: request => true,
        authorizedToCreate: request => true,
        authorizedToUpdate: request => true,
        authorizedToDelete: request => true
    }

    public onFieldUpdate: any = null

    public hooks: {
        beforeCreate: FieldHookFunction
        beforeUpdate: FieldHookFunction
        afterCreate: FieldHookFunction
        afterUpdate: FieldHookFunction
        onUpdate: FieldHookFunction
    } = {
        beforeCreate: payload => {
            return payload
        },

        beforeUpdate: payload => {
            return payload
        },

        onUpdate: payload => {
            return payload
        },

        afterCreate: payload => {
            return payload
        },

        afterUpdate: payload => {
            return payload
        }
    }

    public afterConfigSet() {}

    public onUpdate(onUpdate: any) {
        this.onFieldUpdate = onUpdate

        return this
    }

    public beforeCreate(hook: FieldHookFunction) {
        this.hooks = {
            ...this.hooks,
            beforeCreate: hook
        }

        return this
    }

    public beforeUpdate(hook: FieldHookFunction) {
        this.hooks = {
            ...this.hooks,
            beforeUpdate: hook
        }

        return this
    }

    public afterCreate(hook: FieldHookFunction) {
        this.hooks = {
            ...this.hooks,
            afterCreate: hook
        }

        return this
    }

    public afterUpdate(hook: FieldHookFunction) {
        this.hooks = {
            ...this.hooks,
            afterUpdate: hook
        }

        return this
    }

    /**
     *
     * The name of the field. Will be used to display table columns,
     * field labels etc
     */
    public name: string

    public databaseFieldType: string = ''

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

    public isRelationshipField: boolean = false

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

    public camelCaseName: string

    public camelCaseNamePlural: string

    public pascalCaseName: string
    public snakeCaseName: string
    public snakeCaseNamePlural: string

    public capsDatabasefieldName: string

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
    public defaultValue: string | number | boolean = ''

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

        this.property.name = this.databaseField
        this.relatedProperty.name = this.databaseField

        this.camelCaseName = camelCase(name)
        this.pascalCaseName = pascalCase(name)
        this.snakeCaseName = snakeCase(name)
        this.snakeCaseNamePlural = snakeCase(name)
        this.camelCaseNamePlural = Pluralize(this.camelCaseName)
        this.capsDatabasefieldName = this.databaseField.toUpperCase()
    }

    /**
     *
     * Show this field on the index page
     */
    public showOnIndex() {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: true
        }

        return this
    }

    /**
     *
     * Show this field on the detail page
     */
    public showOnDetail() {
        this.showHideField = {
            ...this.showHideField,
            showOnDetail: true
        }

        return this
    }

    /**
     *
     * Show this field on the creation page
     */
    public showOnCreate() {
        this.showHideField = {
            ...this.showHideField,
            showOnCreation: true
        }

        return this
    }

    /**
     *
     * Show this field on the update page
     */
    public showOnUpdate() {
        this.showHideField = {
            ...this.showHideField,
            showOnUpdate: true
        }

        return this
    }

    /**
     *
     * Hide this field on the index page
     */
    public hideOnIndex() {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: false
        }

        return this
    }

    /**
     *
     * Hide this field from the detail page
     */
    public hideOnDetail() {
        this.showHideField = {
            ...this.showHideField,
            showOnDetail: false
        }

        return this
    }

    /**
     *
     * Hide this field from the create form
     */
    public hideOnCreate() {
        this.showHideField = {
            ...this.showHideField,
            showOnCreation: false
        }

        return this
    }

    /**
     *
     * Hide this field from the update form
     */
    public hideOnUpdate() {
        this.showHideField = {
            ...this.showHideField,
            showOnUpdate: false
        }

        return this
    }

    /**
     *
     * Hide this field everywhere, except the index page
     */
    public onlyOnIndex() {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: true,
            showOnUpdate: false,
            showOnCreation: false,
            showOnDetail: false
        }

        return this
    }

    /**
     *
     * Hide this field everuwhere, except the
     * create and update forms
     */
    public onlyOnForms() {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: false,
            showOnUpdate: true,
            showOnCreation: true,
            showOnDetail: false
        }

        return this
    }

    /**
     *
     * Show this field only on the detail and,
     * index pages. hidden on create and
     * update forms.
     */
    public exceptOnForms() {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: true,
            showOnUpdate: false,
            showOnCreation: false,
            showOnDetail: true
        }

        return this
    }

    public hideFromApi() {
        this.showHideFieldFromApi.hideFromCreateApi = true
        this.showHideFieldFromApi.hideFromFetchApi = true
        this.showHideFieldFromApi.hideFromShowApi = true
        this.showHideFieldFromApi.hideFromDeleteApi = true
        this.showHideFieldFromApi.hideFromUpdateApi = true

        return this
    }

    public hideFromCreateApi() {
        this.showHideFieldFromApi.hideFromCreateApi = true

        return this
    }

    public hideFromUpdateApi() {
        this.showHideFieldFromApi.hideFromUpdateApi = true

        return this
    }

    public hideFromDeleteApi() {
        this.showHideFieldFromApi.hideFromDeleteApi = true

        return this
    }

    public hideFromFetchApi() {
        this.showHideFieldFromApi.hideFromFetchApi = true

        return this
    }

    public hideFromShowApi() {
        this.showHideFieldFromApi.hideFromShowApi = true

        return this
    }

    /**
     *
     * Make this field sortable
     *
     */
    public sortable<T extends FieldContract>(this: T): T {
        this.isSortable = true

        return this
    }

    /**
     *
     * Make this field searchable. will also index
     * this field in the database.
     *
     * This method optionally takes in the name of the index.
     *
     */
    public searchable<T extends FieldContract>(
        this: T,
        index: string | boolean = true
    ): T {
        this.property.index = index

        return this
    }

    public onCreate<T extends FieldContract>(this: T, onCreate: () => void): T {
        this.property.onCreate = onCreate

        return this
    }

    /**
     *
     * Make this field unique
     *
     */
    public unique<T extends FieldContract>(this: T) {
        this.property.unique = true

        return this
    }

    /**
     *
     * Make this field unsigned
     *
     */
    public unsigned<T extends FieldContract>(this: T) {
        this.property.unsigned = true

        return this
    }

    /**
     * Make this field a primary field
     *
     */
    public primary<T extends FieldContract>(this: T) {
        this.property.primary = true

        return this
    }

    /**
     *
     * Make this field signed
     *
     */
    public signed<T extends FieldContract>(this: T) {
        this.property.unsigned = false

        return this
    }

    public notUnique<T extends FieldContract>(this: T): T {
        this.property.unique = false

        return this
    }

    /**
     *
     * Make this field nullable
     *
     */
    public notNullable<T extends FieldContract>(this: T): T {
        this.property.nullable = false
        this.relatedProperty.nullable = false

        return this
    }

    public virtual<T extends FieldContract>(this: T): T {
        this.property.persist = false

        return this
    }

    /**
     *
     * Make this field nullable
     *
     */
    public nullable<T extends FieldContract>(this: T): T {
        this.property.nullable = true
        this.relatedProperty.nullable = true

        return this
    }

    /**
     *
     * Define the description. This would be a help text
     * that provides more information to the user
     * about this field on forms.
     */
    public description<T extends FieldContract>(
        this: T,
        description: string
    ): T {
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
    public default<T extends FieldContract>(
        this: T,
        value: string | number | boolean | null
    ): T {
        this.defaultValue = value
        this.property.default = value

        return this
    }

    /**
     *
     * Set the default value for this field.
     * Will show up on create forms as
     * default
     *
     */
    public defaultRaw<T extends FieldContract>(this: T, value: string): T {
        this.property.defaultRaw = value

        return this
    }

    /**
     *
     * Set html attributes for this component
     */
    public htmlAttributes<T extends FieldContract>(this: T, attributes: {}): T {
        this.attributes = attributes

        return this
    }

    /**
     *
     * @param this
     */
    public rules<T extends FieldContract>(this: T, ...rules: Array<string>): T {
        this.validationRules = Array.from(
            new Set([...this.validationRules, ...rules])
        )

        return this
    }

    /**
     * Set the validation rules to be used when
     * creating this field to the database
     */
    public creationRules<T extends FieldContract>(
        this: T,
        ...rules: Array<string>
    ): T {
        this.creationValidationRules = Array.from(
            new Set([...this.creationValidationRules, ...rules])
        )

        return this
    }

    /**
     * Set the validation rules to be used when updating
     * this field
     */
    public updateRules<T extends FieldContract>(
        this: T,
        ...rules: Array<string>
    ): T {
        this.updateValidationRules = Array.from(
            new Set([...this.updateValidationRules, ...rules])
        )

        return this
    }

    /**
     * Set this field to be a hidden field. It won't show up
     * in query results.
     */
    public hidden<T extends FieldContract>(this: T): T {
        this.property.hidden = true

        return this
    }

    public canSee(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks['authorizedToSee'] = authorizeFunction

        return this
    }

    public canCreate(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks['authorizedToCreate'] = authorizeFunction

        return this
    }

    public canUpdate(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks['authorizedToUpdate'] = authorizeFunction

        return this
    }

    public canDelete(authorizeFunction: AuthorizeFunction) {
        this.authorizeCallbacks['authorizedToDelete'] = authorizeFunction

        return this
    }

    public hiddenFromApi() {
        return (
            Object.values(this.showHideFieldFromApi).filter(shown => shown)
                .length === 0 || !!this.property.hidden
        )
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
            isUnique: this.isUnique,
            component: this.component,
            description: this.helpText,
            isNullable: this.isNullable,
            isSortable: this.isSortable,
            attributes: this.attributes,
            rules: this.validationRules,
            inputName: this.databaseField,
            isSearchable: this.isSearchable,
            defaultValue: this.defaultValue,
            fieldName: this.constructor.name,
            snakeCaseName: this.snakeCaseName,
            databaseField: this.databaseField,
            camelCaseName: camelCase(this.name),
            pascalCaseName: this.pascalCaseName,
            updateRules: this.updateValidationRules,
            databaseFieldType: this.databaseFieldType,
            creationRules: this.creationValidationRules,
            camelCaseNamePlural: this.camelCaseNamePlural,
            isRelationshipField: this.isRelationshipField,
            snakeCaseNamePlural: this.snakeCaseNamePlural,
            capsDatabasefieldName: this.capsDatabasefieldName
        }
    }
}

export default Field
