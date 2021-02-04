declare module '@tensei/common/fields' {
    import {
        FieldHookFunction,
        AuthorizeFunction,
        Config
    } from '@tensei/common/config'
    import {
        ReferenceType,
        Cascade,
        LoadStrategy,
        QueryOrder,
        Constructor as ORMConstructor,
        EntityProperty,
        Dictionary
    } from '@mikro-orm/core'

    interface Constructor<M> {
        new (...args: any[]): M
    }

    type SanitizationRules =
        | 'escape'
        | 'lower_case'
        | 'normalize_email'
        | 'plural'
        | 'singular'
        | 'slug'
        | 'strip_links'
        | 'strip_tags'
        | 'trim'
        | 'uppercase'

    interface FieldProperty {
        name?: string
        entity?: () => any
        type?: string
        columnTypes?: string[]
        primary?: boolean
        serializedPrimaryKey?: boolean
        lazy?: boolean
        array?: boolean
        length?: any
        reference?: ReferenceType
        wrappedReference?: boolean
        fieldNames?: string[]
        fieldNameRaw?: string
        default?: string | number | boolean | null
        defaultRaw?: string
        formula?: (alias: string) => string
        prefix?: string | boolean
        embedded?: [string, string]
        embeddable?: ORMConstructor<T>
        embeddedProps?: Dictionary<EntityProperty>
        object?: boolean
        index?: boolean | string
        unique?: boolean | string
        nullable?: boolean
        inherited?: boolean
        unsigned?: boolean
        mapToPk?: boolean
        persist?: boolean
        hidden?: boolean
        enum?: boolean
        items?: (number | string)[]
        version?: boolean
        eager?: boolean
        setter?: boolean
        getter?: boolean
        getterName?: any
        cascade?: Cascade[]
        orphanRemoval?: boolean
        mappedBy?: string
        inversedBy?: string
        onCreate?: (entity: any) => any
        onUpdate?: (entity: any) => any
        onDelete?: 'cascade' | 'no action' | 'set null' | 'set default' | string
        onUpdateIntegrity?:
            | 'cascade'
            | 'no action'
            | 'set null'
            | 'set default'
            | string
        strategy?: LoadStrategy
        owner?: boolean
        inversedBy?: string
        mappedBy?: string
        orderBy?: {
            [field: string]: QueryOrder
        }
        fixedOrder?: boolean
        fixedOrderColumn?: string
        pivotTable?: string
        joinColumn?: string
        joinColumns?: string[]
        inverseJoinColumns?: string[]
        referencedColumnNames?: string[]
        referencedTableName?: string
        serializer?: (value: any) => any
        serializedName?: string
        comment?: string
        userDefined?: boolean
    }

    interface SerializedField {
        name: string
        sidebar: boolean
        component: FieldContract['component']
        inputName: string
        isSortable: boolean
        description: string
        rules: string[]
        defaultValue: any
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
        showOnPanel: boolean
        fieldName: string
        camelCaseName: string
        capsDatabasefieldName: string
        databaseField: string
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
        snakeCaseName: string
        snakeCaseNamePlural: string
    }
    interface FieldContract<FieldDocument = any> {
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
        component: {
            form: string
            index: string
            detail: string
        }
        sanitizeRule?: SanitizationRules
        showHideFieldFromApi: {
            hideOnInsertApi: boolean
            hideOnUpdateApi: boolean
            hideOnDeleteApi: boolean
            hideOnFetchApi: boolean
        }
        tenseiConfig: Config | null
        authorizeCallbacks: {
            authorizedToSee: AuthorizeFunction
            authorizedToCreate: AuthorizeFunction
            authorizedToUpdate: AuthorizeFunction
            authorizedToDelete: AuthorizeFunction
        }
        property: FieldProperty
        relatedProperty: FieldProperty
        afterConfigSet(): void
        isRelationshipField: boolean
        onUpdate(hook: () => any): this
        onCreate(hook: () => any): this
        shadow(): this
        removeFromSidebarOnForms(): this
        dockToSidebarOnForms(): this
        formComponent(component: string): this
        indexComponent(component: string): this
        detailComponent(component: string): this
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
        defaultValue: any

        camelCaseName: string

        pascalCaseName: string

        camelCaseNamePlural: string

        snakeCaseName: string
        snakeCaseNamePlural: string

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
        hideOnApi(): this
        hideOnInsertApi(): this
        hideOnUpdateApi(): this
        hideOnDeleteApi(): this
        hideOnFetchApi(): this
        isHiddenOnApi(): boolean
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
         * Make this field not nullable
         *
         */
        notNullable<T extends FieldContract>(this: T): T

        /**
         *
         * Make this field nullable
         *
         */
        nullable<T extends FieldContract>(this: T): T
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
        default<T extends FieldContract>(this: T, value: any): T
        defaultFormValue<T extends FieldContract>(this: T, value: any): T
        defaultRaw<T extends FieldContract>(this: T, value: any): T
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
        sanitize<T extends FieldContract>(this: T, rule: SanitizationRules): T
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
    interface TextContract extends FieldContract {
        truncate(sub: number): this
    }

    export type SlugTypes = 'default' | 'date' | 'random'

    interface SlugContract extends FieldContract {
        from(field: string, inputName?: string): this
        type(slugType: SlugTypes): this
        editable(): this
    }

    const slug: (name: string, databaseField?: string) => SlugContract
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
    interface FloatContract extends NumberFieldContract {}
    const float: (
        name: string,
        databaseField?: string | undefined
    ) => FloatContract

    interface DoubleContract extends NumberFieldContract {}
    const double: (
        name: string,
        databaseField?: string | undefined
    ) => DoubleContract

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
        defaultToNow(): this
        timePicker24Hr(): this
        format(format: string): this
        pickerFormat(format: string): this
    }
    const date: (
        name: string,
        databaseField?: string | undefined
    ) => DateFieldContract
    interface TimestampContract extends DateFieldContract {}
    interface JsonContract extends DateFieldContract {}
    interface LinkContract extends TextContract {}
    interface RelationshipField extends FieldContract {
        cascades(cascades: Cascade[]): this
        foreignKey(foreignKey: string): this
        owner(): this
        alwaysLoad(): this
        label(label: string): this
    }
    const oneToOne: (name: string, databaseField?: string) => RelationshipField
    const oneToMany: (name: string, databaseField?: string) => RelationshipField
    const manyToOne: (name: string, databaseField?: string) => RelationshipField
    const manyToMany: (
        name: string,
        databaseField?: string
    ) => RelationshipField
    interface ArrayContract extends FieldContract {
        of(arrayOf: 'string' | 'number'): this
    }
    interface BooleanFieldContract extends FieldContract {
        trueLabel(value: string): this
        falseLabel(value: string): this
        positiveValues(values: any[]): this
    }
    const boolean: (
        name: string,
        databaseField?: string | undefined
    ) => BooleanFieldContract
    interface DateTimeContract extends DateFieldContract {}
    interface BigIntegerContract extends IntegerContract {}
    const bigInteger: (
        name: string,
        databaseField?: string | undefined
    ) => BigIntegerContract
    interface IDContract extends FieldContract {}
    const id: (name: string, databaseField?: string | undefined) => IDContract
    const belongsToMany: (name: string) => RelationshipField
    const hasMany: (
        name: string,
        databaseField?: string | undefined
    ) => RelationshipField
    const hasOne: (
        name: string,
        databaseField?: string | undefined
    ) => RelationshipField
    const dateTime: (
        name: string,
        databaseField?: string | undefined
    ) => DateTimeContract
    const belongsTo: (
        name: string,
        databaseField?: string | undefined
    ) => RelationshipField
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
        tenseiConfig: Config | null
        authorizeCallbacks: {
            authorizedToSee: AuthorizeFunction
            authorizedToCreate: AuthorizeFunction
            authorizedToUpdate: AuthorizeFunction
            authorizedToDelete: AuthorizeFunction
        }
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
         *shi
         * This is a short name for the frontend component that
         * will be mounted for this field.
         */
        component: {
            form: string
            detail: string
            index: string
        }
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
        defaultValue: any
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
