declare module '@tensei/common/fields' {
    import {
        FieldHookFunction,
        AuthorizeFunction,
        Config
    } from '@tensei/common/config'

    interface Constructor<M> {
        new (...args: any[]): M
    }

    interface SerializedField {
        name: string
        component: string
        inputName: string
        isSortable: boolean
        description: string
        rules: string[]
        defaultValue: string | boolean | number
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
        capsDatabasefieldName: string
        databaseField: string
        databaseFieldType: string
        attributes: {
            [key: string]: string
        }
        selectOptions?: {
            label: string
            value: string
        }[]
        defaultToNow?: boolean
        isUnsigned?: boolean
        trueLabel?: string
        falseLabel?: string
        isRelationshipField: boolean
        camelCaseName: string
        camelCaseNamePlural: string
        pascalCaseName: string
    }
    interface FieldContract {
        showHideField: {
            /**
             *
             * If this is true, the field will be shown on the
             * index page
             *
             */
            showOnIndex: boolean
            /**
             *
             * If this is true, the field will be updatable. It will
             * show up on the update page
             *
             */
            showOnUpdate: boolean
            /**
             *
             * If this is true, the field will show up on the detail page
             */
            showOnDetail: boolean
            /**
             *
             * If this is true, the field will be shown on the creation
             * form
             */
            showOnCreation: boolean
        }
        tenseiConfig: Config|null
        authorizeCallbacks: {
            authorizedToSee: AuthorizeFunction
            authorizedToCreate: AuthorizeFunction
            authorizedToUpdate: AuthorizeFunction
            authorizedToDelete: AuthorizeFunction
        }
        hooks: {
            beforeCreate: FieldHookFunction
            beforeUpdate: FieldHookFunction
            afterCreate: FieldHookFunction
            afterUpdate: FieldHookFunction
        }
        databaseFieldType: string
        afterConfigSet(): void
        beforeCreate(hook: FieldHookFunction): this
        beforeUpdate(hook: FieldHookFunction): this
        afterCreate(hook: FieldHookFunction): this
        afterUpdate(hook: FieldHookFunction): this
        /**
         *
         * The name of the field. Will be used to display table columns,
         * field labels etc
         */
        name: string
        /**
         *
         * Define validation rules to be used to validate
         * this field on forms
         */
        validationRules: Array<string>
        /**
         *
         * Define validation rules to be used to validate
         * this field on creation forms
         */
        creationValidationRules: Array<string>
        /**
         *
         * Define validation rules to be used to validate
         * this field on update forms
         */
        updateValidationRules: Array<string>
        /**
         *
         * This is a set of all html attributes to be passed
         * to this component
         *
         */
        attributes: {}
        /**
         *
         * This value set to true will hide this field completely
         * from all query results.
         */
        isHidden: boolean
        /**
         *
         * This is a short name for the frontend component that
         * will be mounted for this field.
         */
        component: string
        /**
         *
         * The database field associated with this field.
         * By default, this will be the camel case
         * version of the name
         *
         */
        databaseField: string
        /**
         *
         * The
         */
        helpText: string
        isNullable: boolean
        isUnique: boolean
        /**
         *
         * Adds database sorting by this field. Will show up
         * on the index page, on the table headers.
         *
         */
        isSortable: boolean
        isSearchable: boolean
        /**
         *
         * Set the default value of this
         * field
         *
         */
        defaultValue: string | number | boolean

        camelCaseName: string

        pascalCaseName: string

        camelCaseNamePlural: string

        capsDatabasefieldName: string
        /**
         * Instantiate a new field. Requires the name,
         * and optionally the corresponding database
         * field. This field if not provided will
         * default to the camel case version of
         * the name.
         */
        /**
         *
         * Show this field on the index page
         */
        showOnIndex(): this
        /**
         *
         * Show this field on the detail page
         */
        showOnDetail(): this
        /**
         *
         * Show this field on the creation page
         */
        showOnCreate(): this
        /**
         *
         * Show this field on the update page
         */
        showOnUpdate(): this
        /**
         *
         * Hide this field on the index page
         */
        hideOnIndex(): this
        /**
         *
         * Hide this field from the detail page
         */
        hideOnDetail(): this
        /**
         *
         * Hide this field from the create form
         */
        hideOnCreate(): this
        /**
         *
         * Hide this field from the update form
         */
        hideOnUpdate(): this
        /**
         *
         * Hide this field everywhere, except the index page
         */
        onlyOnIndex(): this
        /**
         *
         * Hide this field everuwhere, except the
         * create and update forms
         */
        onlyOnForms(): this
        /**
         *
         * Show this field only on the detail and,
         * index pages. hidden on create and
         * update forms.
         */
        exceptOnForms(): this
        /**
         *
         * Make this field sortable
         *
         */
        sortable<T extends FieldContract>(this: T): T
        /**
         *
         * Make this field searchable. will also index
         * this field in the database.
         *
         */
        searchable<T extends FieldContract>(this: T): T
        /**
         *
         * Make this field sortable
         *
         */
        unique<T extends FieldContract>(this: T): T
        /**
         *
         * Make this field nullable
         *
         */
        notNullable<T extends FieldContract>(this: T): T
        /**
         *
         * Define the description. This would be a help text
         * that provides more information to the user
         * about this field on forms.
         */
        description<T extends FieldContract>(this: T, description: string): T
        /**
         *
         * Set the default value for this field.
         * Will show up on create forms as
         * default
         *
         */
        default<T extends FieldContract>(
            this: T,
            value: string | number | boolean
        ): T
        /**
         *
         * Set html attributes for this component
         */
        htmlAttributes<T extends FieldContract>(this: T, attributes: {}): T
        /**
         *
         * @param this
         */
        rules<T extends FieldContract>(this: T, ...rules: Array<string>): T
        /**
         * Set the validation rules to be used when
         * creating this field to the database
         */
        creationRules<T extends FieldContract>(
            this: T,
            ...rules: Array<string>
        ): T
        /**
         * Set the validation rules to be used when updating
         * this field
         */
        updateRules<T extends FieldContract>(
            this: T,
            ...rules: Array<string>
        ): T
        /**
         * Set this field to be a hidden field. It won't show up
         * in query results.
         */
        hidden<T extends FieldContract>(this: T): T
        canSee(authorizeFunction: AuthorizeFunction): this
        canCreate(authorizeFunction: AuthorizeFunction): this
        canUpdate(authorizeFunction: AuthorizeFunction): this
        canDelete(authorizeFunction: AuthorizeFunction): this
        /**
         *
         * Serializes the field for data to be sent
         * to the frontend
         *
         */
        serialize(): SerializedField
    }
    interface TextContract extends FieldContract {}
    const text: (
        name: string,
        databaseField?: string | undefined
    ) => TextContract
    interface NumberFieldContract extends TextContract {
        /**
         * Set the min value for this number field.
         * Will be the min on the number in
         * forms
         *
         */
        min(min: number): this
        /**
         * Set the max value for this number field.
         * Will be the max on the number in
         * forms
         *
         */
        max(max: number): this
    }
    const number: (
        name: string,
        databaseField?: string | undefined
    ) => NumberFieldContract
    interface IntegerContract extends NumberFieldContract {
        isUnsigned: boolean
        isForeign: boolean
        /**
         * Set the min value for this number field.
         * Will be the min on the number in
         * forms
         *
         */
        min(min: number): this
        /**
         * Set the max value for this number field.
         * Will be the max on the number in
         * forms
         *
         */
        max(max: number): this
        foreign(): this
        /**
         *
         * Make this field sortable
         *
         */
        unsigned(): this
    }
    const integer: (
        name: string,
        databaseField?: string | undefined
    ) => IntegerContract
    interface Option {
        label: string
        value: string
    }
    interface SelectContract extends FieldContract {
        selectOptions: Option[]
        options(options: Option[]): this
    }
    const select: (
        name: string,
        databaseField?: string | undefined
    ) => SelectContract
    interface TextareaContract extends TextContract {}
    const textarea: (
        name: string,
        databaseField?: string | undefined
    ) => TextareaContract
    interface DateFieldContract extends FieldContract {
        /**
         *
         * Set the date format to be used
         * The date-fns library is used by
         * tensei
         *
         * https://date-fns.org/v2.14.0/docs/format
         */
        format(format: string): this
        defaultToNow(): this
    }
    const date: (
        name: string,
        databaseField?: string | undefined
    ) => DateFieldContract
    interface TimestampContract extends DateFieldContract {}
    interface JsonContract extends DateFieldContract {}
    interface LinkContract extends TextContract {}
    interface ArrayContract extends FieldContract {
        of(arrayOf: 'string' | 'number'): this
    }
    interface BooleanFieldContract extends FieldContract {
        trueLabel(value: string): this
        falseLabel(value: string): this
    }
    const boolean: (
        name: string,
        databaseField?: string | undefined
    ) => BooleanFieldContract
    interface BelongsToContract extends IntegerContract {}
    interface DateTimeContract extends DateFieldContract {}
    interface BigIntegerContract extends IntegerContract {}
    const bigInteger: (
        name: string,
        databaseField?: string | undefined
    ) => BigIntegerContract
    interface BelongsToManyContract extends IntegerContract {
        notNullable<T extends FieldContract>(this: T): T
    }
    interface HasManyContract extends FieldContract {}
    interface IDContract extends FieldContract {}
    const id: (name: string, databaseField?: string | undefined) => IDContract
    const belongsToMany: (name: string) => BelongsToManyContract
    const hasMany: (
        name: string,
        databaseField?: string | undefined
    ) => HasManyContract
    const dateTime: (
        name: string,
        databaseField?: string | undefined
    ) => DateTimeContract
    const belongsTo: (
        name: string,
        databaseField?: string | undefined
    ) => BelongsToContract
    const json: (
        name: string,
        databaseField?: string | undefined
    ) => JsonContract
    const link: (
        name: string,
        databaseField?: string | undefined
    ) => LinkContract
    const timestamp: (
        name: string,
        databaseField?: string | undefined
    ) => TimestampContract
    const array: (
        name: string,
        databaseField?: string | undefined
    ) => ArrayContract

    export declare class Field implements FieldContract {
        showHideField: {
            /**
             *
             * If this is true, the field will be shown on the
             * index page
             *
             */
            showOnIndex: boolean
            /**
             *
             * If this is true, the field will be updatable. It will
             * show up on the update page
             *
             */
            showOnUpdate: boolean
            /**
             *
             * If this is true, the field will show up on the detail page
             */
            showOnDetail: boolean
            /**
             *
             * If this is true, the field will be shown on the creation
             * form
             */
            showOnCreation: boolean
        }
        tenseiConfig: Config|null
        authorizeCallbacks: {
            authorizedToSee: AuthorizeFunction
            authorizedToCreate: AuthorizeFunction
            authorizedToUpdate: AuthorizeFunction
            authorizedToDelete: AuthorizeFunction
        }
        hooks: {
            beforeCreate: FieldHookFunction
            beforeUpdate: FieldHookFunction
            afterCreate: FieldHookFunction
            afterUpdate: FieldHookFunction
        }
        beforeCreate(hook: FieldHookFunction): this
        beforeUpdate(hook: FieldHookFunction): this
        afterCreate(hook: FieldHookFunction): this
        afterUpdate(hook: FieldHookFunction): this
        /**
         *
         * The name of the field. Will be used to display table columns,
         * field labels etc
         */
        name: string
        public databaseFieldType: string
        /**
         *
         * Define validation rules to be used to validate
         * this field on forms
         */
        validationRules: Array<string>
        /**
         *
         * Define validation rules to be used to validate
         * this field on creation forms
         */
        creationValidationRules: Array<string>
        /**
         *
         * Define validation rules to be used to validate
         * this field on update forms
         */
        updateValidationRules: Array<string>
        /**
         *
         * This is a set of all html attributes to be passed
         * to this component
         *
         */
        attributes: {}
        /**
         *
         * This value set to true will hide this field completely
         * from all query results.
         */
        isHidden: boolean
        protected isRelationshipField: boolean
        /**
         *
         * This is a short name for the frontend component that
         * will be mounted for this field.
         */
        component: string
        /**
         *
         * The database field associated with this field.
         * By default, this will be the camel case
         * version of the name
         *
         */
        databaseField: string
        /**
         *
         * The
         */
        helpText: string
        isNullable: boolean
        isUnique: boolean
        /**
         *
         * Adds database sorting by this field. Will show up
         * on the index page, on the table headers.
         *
         */
        isSortable: boolean
        isSearchable: boolean
        /**
         *
         * Set the default value of this
         * field
         *
         */
        defaultValue: string | number | boolean
        /**
         * Instantiate a new field. Requires the name,
         * and optionally the corresponding database
         * field. This field if not provided will
         * default to the camel case version of
         * the name.
         */
        constructor(name: string, databaseField?: string)
        /**
         *
         * Show this field on the index page
         */
        showOnIndex(): this
        /**
         *
         * Show this field on the detail page
         */
        showOnDetail(): this
        /**
         *
         * Show this field on the creation page
         */
        showOnCreate(): this
        /**
         *
         * Show this field on the update page
         */
        showOnUpdate(): this
        /**
         *
         * Hide this field on the index page
         */
        hideOnIndex(): this
        /**
         *
         * Hide this field from the detail page
         */
        hideOnDetail(): this
        /**
         *
         * Hide this field from the create form
         */
        hideOnCreate(): this
        /**
         *
         * Hide this field from the update form
         */
        hideOnUpdate(): this
        /**
         *
         * Hide this field everywhere, except the index page
         */
        onlyOnIndex(): this
        /**
         *
         * Hide this field everuwhere, except the
         * create and update forms
         */
        onlyOnForms(): this
        /**
         *
         * Show this field only on the detail and,
         * index pages. hidden on create and
         * update forms.
         */
        exceptOnForms(): this
        /**
         *
         * Make this field sortable
         *
         */
        sortable<T extends FieldContract>(this: T): T
        /**
         *
         * Make this field searchable. will also index
         * this field in the database.
         *
         */
        searchable<T extends FieldContract>(this: T): T
        /**
         *
         * Make this field sortable
         *
         */
        unique<T extends FieldContract>(this: T): T
        /**
         *
         * Make this field nullable
         *
         */
        notNullable<T extends FieldContract>(this: T): T
        /**
         *
         * Define the description. This would be a help text
         * that provides more information to the user
         * about this field on forms.
         */
        description<T extends FieldContract>(this: T, description: string): T
        /**
         *
         * Set the default value for this field.
         * Will show up on create forms as
         * default
         *
         */
        default<T extends FieldContract>(
            this: T,
            value: string | number | boolean
        ): T
        /**
         *
         * Set html attributes for this component
         */
        htmlAttributes<T extends FieldContract>(this: T, attributes: {}): T
        /**
         *
         * @param this
         */
        rules<T extends FieldContract>(this: T, ...rules: Array<string>): T
        /**
         * Set the validation rules to be used when
         * creating this field to the database
         */
        creationRules<T extends FieldContract>(
            this: T,
            ...rules: Array<string>
        ): T
        /**
         * Set the validation rules to be used when updating
         * this field
         */
        updateRules<T extends FieldContract>(
            this: T,
            ...rules: Array<string>
        ): T
        /**
         * Set this field to be a hidden field. It won't show up
         * in query results.
         */
        hidden<T extends FieldContract>(this: T): T
        canSee(authorizeFunction: AuthorizeFunction): this
        canCreate(authorizeFunction: AuthorizeFunction): this
        canUpdate(authorizeFunction: AuthorizeFunction): this
        canDelete(authorizeFunction: AuthorizeFunction): this
        /**
         *
         * Serializes the field for data to be sent
         * to the frontend
         *
         */
        serialize(): SerializedField
    }
    export declare class Text extends Field {
        public databaseFieldType: string
    }
    export declare class Textarea extends Text {
        public databaseFieldType: string
    }

    export declare class ArrayField extends Field {}
}
