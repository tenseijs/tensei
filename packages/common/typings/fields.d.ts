declare module '@tensei/common/fields' {
  import {
    FieldHookFunction,
    AuthorizeFunction,
    Config,
    DataPayload
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
  import Faker from 'faker'

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
    type?: any
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
    virtualGetter?: (value: any) => any
  }

  interface SerializedField {
    name: string
    sidebar: boolean
    isVirtual: boolean
    component: FieldContract['component']
    inputName: string
    isSortable: boolean
    isFilterable: boolean
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
      hideOnCreateApi: boolean
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
    graphqlType: string
    relatedProperty: FieldProperty
    afterConfigSet(): void
    type(type: string): thishis
    isRelationshipField: boolean
    onUpdate(hook: () => any): thishis
    onCreate(hook: () => any): thishis
    virtual(compute: (value: any) => any): thishis
    removeFromSidebarOnForms(): thishis
    dockToSidebarOnForms(): thishis
    required(): thishis
    requiredOnCreate(): thishis
    requiredOnUpdate(): thishis
    serializer(serializeFn: (value: any) => any): thishis
    formComponent(component: string): thishis
    indexComponent(component: string): thishis
    detailComponent(component: string): thishis
    getValueFromPayload(payload: DataPayload, request: Express.Request): any
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

    arrayValidationRules: Array<string>
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
    isFilterable: boolean
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
    showOnIndex(): thishis
    /**
     *
     * Show this field on the detail page
     */
    showOnDetail(): thishis
    /**
     *
     * Show this field on the creation page
     */
    showOnCreate(): thishis
    /**
     *
     * Show this field on the update page
     */
    showOnUpdate(): thishis
    /**
     *
     * Hide this field on the index page
     */
    hideOnIndex(): thishis
    /**
     *
     * Hide this field from the detail page
     */
    hideOnDetail(): thishis
    /**
     *
     * Hide this field from the create form
     */
    hideOnCreate(): thishis
    /**
     *
     * Hide this field from the update form
     */
    hideOnUpdate(): thishis
    /**
     *
     * Hide this field everywhere, except the index page
     */
    onlyOnIndex(): thishis
    /**
     *
     * Hide this field everuwhere, except the
     * create and update forms
     */
    onlyOnForms(): thishis
    /**
     *
     * Show this field only on the detail and,
     * index pages. hidden on create and
     * update forms.
     */
    exceptOnForms(): thishis
    hideOnApi(): thishis
    hideOnCreateApi(): thishis
    hideOnUpdateApi(): thishis
    hideOnDeleteApi(): thishis
    hideOnFetchApi(): thishis
    isHiddenOnApi(): boolean
    /**
     *
     * Make this field sortable
     *
     */
    sortable(): thishis
    /**
     *
     * Make this field searchable. will also index
     * this field in the database.
     *
     */
    searchable(): thishis
    /**
     *
     * Make this field sortable
     *
     */
    unique(): thishis
    /**
     *
     * Make this field not nullable
     *
     */
    notNullable(): thishis

    /**
     *
     * Make this field nullable
     *
     */
    nullable(this: thishis): thishis
    /**
     *
     * Define the description. This would be a help text
     * that provides more information to the user
     * about this field on forms.
     */
    description(description: string): this
    /**
     *
     * Set the default value for this field.
     * Will show up on create forms as
     * default
     *
     */
    default(value: any): this
    defaultFormValue(value: any): this
    defaultRaw(value: any): this
    /**
     *
     * Set html attributes for this component
     */
    htmlAttributes(attributes: {}): this
    /**
     *
     * @param this
     */
    rules(...rules: Array<string>): this
    arrayRules(...rules: Array<string>): this
    sanitize(rule: SanitizationRules): this
    /**
     * Set the validation rules to be used when
     * creating this field to the database
     */
    creationRules(...rules: Array<string>): this
    /**
     * Set the validation rules to be used when updating
     * this field
     */
    updateRules(...rules: Array<string>): this
    /**
     * Set this field to be a hidden field. It won't show up
     * in query results.
     */
    hidden<T extends FieldContract>(this: this): this
    canSee(authorizeFunction: AuthorizeFunction): thishis
    canCreate(authorizeFunction: AuthorizeFunction): thishis
    canUpdate(authorizeFunction: AuthorizeFunction): thishis
    canDelete(authorizeFunction: AuthorizeFunction): thishis
    /**
     *
     * Serializes the field for data to be sent
     * to the frontend
     *
     */
    serialize(): SerializedField
  }
  interface TextContract extends FieldContract {
    truncate(sub: number): thishis
  }

  export type SlugTypes = 'default' | 'date' | 'random'

  interface SlugContract extends FieldContract {
    from(field: string, inputName?: string): thishis
    type(slugType: SlugTypes): thishis
    editable(): thishis
  }

  const slug: (name: string, databaseField?: string) => SlugContract
  const text: (name: string, databaseField?: string | undefined) => TextContract
  const password: (
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
    min(min: number): thishis
    /**
     * Set the max value for this number field.
     * Will be the max on the number in
     * forms
     *
     */
    max(max: number): thishis
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
    min(min: number): thishis
    /**
     * Set the max value for this number field.
     * Will be the max on the number in
     * forms
     *
     */
    max(max: number): thishis
    foreign(): thishis
    /**
     *
     * Make this field sortable
     *
     */
    unsigned(): thishis
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
    options(options: (Option | string)[]): thishis
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
    defaultToNow(): thishis
    timePicker24Hr(): thishis
    format(format: string): thishis
    pickerFormat(format: string): thishis
  }
  const date: (
    name: string,
    databaseField?: string | undefined
  ) => DateFieldContract
  interface TimestampContract extends DateFieldContract {}
  interface JsonContract extends DateFieldContract {}
  interface LinkContract extends TextContract {}
  interface RelationshipField extends FieldContract {
    cascades(cascades: Cascade[]): thishis
    foreignKey(foreignKey: string): thishis
    owner(): thishis
    alwaysLoad(): thishis
    label(label: string): thishis
  }
  const oneToOne: (name: string, databaseField?: string) => RelationshipField
  const oneToMany: (name: string, databaseField?: string) => RelationshipField
  const manyToOne: (name: string, databaseField?: string) => RelationshipField
  const manyToMany: (name: string, databaseField?: string) => RelationshipField
  interface ArrayContract extends FieldContract {
    of(arrayOf: 'string' | 'number' | 'decimal' | 'date'): thishis
  }
  interface BooleanFieldContract extends FieldContract {
    trueLabel(value: string): thishis
    falseLabel(value: string): thishis
    positiveValues(values: any[]): thishis
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
  const json: (name: string, databaseField?: string | undefined) => JsonContract
  const link: (name: string, databaseField?: string | undefined) => LinkContract
  const timestamp: (
    name: string,
    databaseField?: string | undefined
  ) => TimestampContract
  const array: (
    name: string,
    databaseField?: string | undefined
  ) => ArrayContract

  export declare class Field implements FieldContract {
    constructor(name: string, databaseField?: string): this
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
      hideOnCreateApi: boolean
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
    graphqlType: string
    relatedProperty: FieldProperty
    afterConfigSet(): void
    type(type: string): thishis
    isRelationshipField: boolean
    onUpdate(hook: () => any): thishis
    onCreate(hook: () => any): thishis
    virtual(compute: (value: any) => any): thishis
    removeFromSidebarOnForms(): thishis
    dockToSidebarOnForms(): thishis
    required(): thishis
    requiredOnCreate(): thishis
    requiredOnUpdate(): thishis
    serializer(serializeFn: (value: any) => any): thishis
    formComponent(component: string): thishis
    indexComponent(component: string): thishis
    detailComponent(component: string): thishis
    getValueFromPayload(payload: DataPayload, request: Express.Request): any
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

    arrayValidationRules: Array<string>
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
    isFilterable: boolean
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
    showOnIndex(): thishis
    /**
     *
     * Show this field on the detail page
     */
    showOnDetail(): thishis
    /**
     *
     * Show this field on the creation page
     */
    showOnCreate(): thishis
    /**
     *
     * Show this field on the update page
     */
    showOnUpdate(): thishis
    /**
     *
     * Hide this field on the index page
     */
    hideOnIndex(): thishis
    /**
     *
     * Hide this field from the detail page
     */
    hideOnDetail(): thishis
    /**
     *
     * Hide this field from the create form
     */
    hideOnCreate(): thishis
    /**
     *
     * Hide this field from the update form
     */
    hideOnUpdate(): thishis
    /**
     *
     * Hide this field everywhere, except the index page
     */
    onlyOnIndex(): thishis
    /**
     *
     * Hide this field everuwhere, except the
     * create and update forms
     */
    onlyOnForms(): thishis
    /**
     *
     * Show this field only on the detail and,
     * index pages. hidden on create and
     * update forms.
     */
    exceptOnForms(): thishis
    hideOnApi(): thishis
    hideOnCreateApi(): thishis
    hideOnUpdateApi(): thishis
    hideOnDeleteApi(): thishis
    hideOnFetchApi(): thishis
    isHiddenOnApi(): boolean
    /**
     *
     * Make this field sortable
     *
     */
    sortable(): thishis
    /**
     *
     * Make this field searchable. will also index
     * this field in the database.
     *
     */
    searchable(): thishis
    /**
     *
     * Make this field sortable
     *
     */
    unique(): thishis
    /**
     *
     * Make this field not nullable
     *
     */
    notNullable(): thishis

    /**
     *
     * Make this field nullable
     *
     */
    nullable(this: thishis): thishis
    /**
     *
     * Define the description. This would be a help text
     * that provides more information to the user
     * about this field on forms.
     */
    description(description: string): this
    /**
     *
     * Set the default value for this field.
     * Will show up on create forms as
     * default
     *
     */
    default(value: any): this
    defaultFormValue(value: any): this
    defaultRaw(value: any): this
    /**
     *
     * Set html attributes for this component
     */
    htmlAttributes(attributes: {}): this
    /**
     *
     * @param this
     */
    rules(...rules: Array<string>): this
    arrayRules(...rules: Array<string>): this
    sanitize(rule: SanitizationRules): this
    /**
     * Set the validation rules to be used when
     * creating this field to the database
     */
    creationRules(...rules: Array<string>): this
    /**
     * Set the validation rules to be used when updating
     * this field
     */
    updateRules(...rules: Array<string>): this
    /**
     * Set this field to be a hidden field. It won't show up
     * in query results.
     */
    hidden<T extends FieldContract>(this: this): this
    canSee(authorizeFunction: AuthorizeFunction): thishis
    canCreate(authorizeFunction: AuthorizeFunction): thishis
    canUpdate(authorizeFunction: AuthorizeFunction): thishis
    canDelete(authorizeFunction: AuthorizeFunction): thishis
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
