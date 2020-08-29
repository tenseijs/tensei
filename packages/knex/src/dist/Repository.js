'use strict'
var __assign =
    (this && this.__assign) ||
    function() {
        __assign =
            Object.assign ||
            function(t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i]
                    for (var p in s)
                        if (Object.prototype.hasOwnProperty.call(s, p))
                            t[p] = s[p]
                }
                return t
            }
        return __assign.apply(this, arguments)
    }
var __awaiter =
    (this && this.__awaiter) ||
    function(thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function(resolve) {
                      resolve(value)
                  })
        }
        return new (P || (P = Promise))(function(resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value))
                } catch (e) {
                    reject(e)
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value))
                } catch (e) {
                    reject(e)
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected)
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
            )
        })
    }
var __generator =
    (this && this.__generator) ||
    function(thisArg, body) {
        var _ = {
                label: 0,
                sent: function() {
                    if (t[0] & 1) throw t[1]
                    return t[1]
                },
                trys: [],
                ops: []
            },
            f,
            y,
            t,
            g
        return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            typeof Symbol === 'function' &&
                (g[Symbol.iterator] = function() {
                    return this
                }),
            g
        )
        function verb(n) {
            return function(v) {
                return step([n, v])
            }
        }
        function step(op) {
            if (f) throw new TypeError('Generator is already executing.')
            while (_)
                try {
                    if (
                        ((f = 1),
                        y &&
                            (t =
                                op[0] & 2
                                    ? y['return']
                                    : op[0]
                                    ? y['throw'] ||
                                      ((t = y['return']) && t.call(y), 0)
                                    : y.next) &&
                            !(t = t.call(y, op[1])).done)
                    )
                        return t
                    if (((y = 0), t)) op = [op[0] & 2, t.value]
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op
                            break
                        case 4:
                            _.label++
                            return { value: op[1], done: false }
                        case 5:
                            _.label++
                            y = op[1]
                            op = [0]
                            continue
                        case 7:
                            op = _.ops.pop()
                            _.trys.pop()
                            continue
                        default:
                            if (
                                !((t = _.trys),
                                (t = t.length > 0 && t[t.length - 1])) &&
                                (op[0] === 6 || op[0] === 2)
                            ) {
                                _ = 0
                                continue
                            }
                            if (
                                op[0] === 3 &&
                                (!t || (op[1] > t[0] && op[1] < t[3]))
                            ) {
                                _.label = op[1]
                                break
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1]
                                t = op
                                break
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2]
                                _.ops.push(op)
                                break
                            }
                            if (t[2]) _.ops.pop()
                            _.trys.pop()
                            continue
                    }
                    op = body.call(thisArg, _)
                } catch (e) {
                    op = [6, e]
                    y = 0
                } finally {
                    f = t = 0
                }
            if (op[0] & 5) throw op[1]
            return { value: op[0] ? op[1] : void 0, done: true }
        }
    }
exports.__esModule = true
exports.SqlRepository = void 0
var knex_1 = require('knex')
var pluralize_1 = require('pluralize')
var bookshelf_1 = require('bookshelf')
var change_case_1 = require('change-case')
var SqlRepository = /** @class */ (function() {
    function SqlRepository() {
        var _this = this
        this.$db = null
        this.config = {}
        this.bookshelfModels = []
        this.resources = []
        this.connectionEstablished = false
        this.establishDatabaseConnection = function() {
            if (!_this.connectionEstablished) {
                _this.$db = knex_1['default'](_this.config)
            }
            _this.connectionEstablished = true
        }
        this.setup = function(config) {
            return __awaiter(_this, void 0, void 0, function() {
                var connection
                return __generator(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            connection = config.env.databaseUrl
                            if (config.env.database === 'sqlite3') {
                                connection = {
                                    filename: config.env.databaseUrl
                                }
                            }
                            this.config = {
                                connection: connection,
                                useNullAsDefault: true,
                                client: config.env.database,
                                debug: false
                            }
                            this.resources = config.resources
                            this.establishDatabaseConnection()
                            return [
                                4 /*yield*/,
                                this.performDatabaseSchemaSync(
                                    config.resources.map(function(resource) {
                                        return resource.serialize()
                                    })
                                )
                            ]
                        case 1:
                            _a.sent()
                            return [4 /*yield*/, this.bootBookshelfModels()]
                        case 2:
                            _a.sent()
                            return [
                                4 /*yield*/,
                                this.setupRolesAndPermissions()
                            ]
                        case 3:
                            _a.sent()
                            return [2 /*return*/, this.$db]
                    }
                })
            })
        }
        this.setResourceModels = function(resources) {
            return resources.map(function(resource, index) {
                resource.Model = function() {
                    return _this.bookshelfModels[index]
                }
                return resource
            })
        }
        this.getResourceBookshelfModel = function(resource) {
            return _this.bookshelfModels.find(function(model) {
                return model.resourceName === resource.data.name
            })
        }
        this.setupRolesAndPermissions = function() {
            return __awaiter(_this, void 0, void 0, function() {
                var permissions,
                    roleResource,
                    permissionResource,
                    RoleModel,
                    PermissionModel,
                    existingPermissions,
                    newPermissionsToCreate,
                    superAdminRole,
                    allPermissions
                return __generator(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            permissions = []
                            this.resources.forEach(function(resource) {
                                ;['create', 'read', 'update', 'delete'].forEach(
                                    function(operation) {
                                        permissions.push(
                                            operation + ':' + resource.data.slug
                                        )
                                        resource.data.fields.forEach(function(
                                            field
                                        ) {
                                            permissions.push(
                                                operation +
                                                    ':' +
                                                    resource.data.slug +
                                                    ':' +
                                                    field.databaseField
                                            )
                                        })
                                    }
                                )
                                resource.data.actions.forEach(function(action) {
                                    permissions.push(
                                        'run:' +
                                            resource.data.slug +
                                            ':' +
                                            action.data.slug
                                    )
                                })
                            })
                            roleResource = this.resources.find(function(
                                resource
                            ) {
                                return (
                                    resource.data.name === 'Administrator Role'
                                )
                            })
                            permissionResource = this.resources.find(function(
                                resource
                            ) {
                                return (
                                    resource.data.name ===
                                    'Administrator Permission'
                                )
                            })
                            if (!roleResource || !permissionResource) {
                                throw {
                                    message:
                                        'Role and Permission resources must be defined.',
                                    status: 500
                                }
                            }
                            RoleModel = this.getResourceBookshelfModel(
                                roleResource
                            )
                            PermissionModel = this.getResourceBookshelfModel(
                                permissionResource
                            )
                            return [
                                4 /*yield*/,
                                PermissionModel.query().whereIn(
                                    'slug',
                                    permissions
                                )
                            ]
                        case 1:
                            existingPermissions = _a
                                .sent()
                                .map(function(permission) {
                                    return permission.slug
                                })
                            newPermissionsToCreate = permissions.filter(
                                function(permission) {
                                    return !existingPermissions.includes(
                                        permission
                                    )
                                }
                            )
                            return [
                                4 /*yield*/,
                                PermissionModel.query().insert(
                                    newPermissionsToCreate.map(function(
                                        permission
                                    ) {
                                        return {
                                            name: change_case_1.sentenceCase(
                                                permission.split(':').join(' ')
                                            ),
                                            slug: permission
                                        }
                                    })
                                )
                            ]
                        case 2:
                            _a.sent()
                            return [
                                4 /*yield*/,
                                RoleModel.query()
                                    .where('slug', 'super-admin')
                                    .limit(1)
                            ]
                        case 3:
                            superAdminRole = _a.sent()[0]
                            if (!!superAdminRole) return [3 /*break*/, 6]
                            return [
                                4 /*yield*/,
                                RoleModel.query().insert({
                                    name: 'Super Admin',
                                    slug: 'super-admin'
                                })
                            ]
                        case 4:
                            _a.sent()
                            return [
                                4 /*yield*/,
                                RoleModel.query()
                                    .where('slug', 'super-admin')
                                    .limit(1)
                            ]
                        case 5:
                            superAdminRole = _a.sent()[0]
                            _a.label = 6
                        case 6:
                            return [4 /*yield*/, PermissionModel.query()]
                        case 7:
                            allPermissions = _a.sent()
                            return [
                                4 /*yield*/,
                                new RoleModel({
                                    id: superAdminRole.id
                                })
                                    [permissionResource.data.slug]()
                                    .detach()
                            ]
                        case 8:
                            _a.sent()
                            return [
                                4 /*yield*/,
                                new RoleModel({
                                    id: superAdminRole.id
                                })
                                    [permissionResource.data.slug]()
                                    .attach(
                                        allPermissions.map(function(
                                            permission
                                        ) {
                                            return permission.id
                                        })
                                    )
                            ]
                        case 9:
                            _a.sent()
                            return [2 /*return*/]
                    }
                })
            })
        }
        this.bootBookshelfModels = function() {
            return __awaiter(_this, void 0, void 0, function() {
                var bookshelfInstance, bookshelfModels
                var _this = this
                return __generator(this, function(_a) {
                    bookshelfInstance = bookshelf_1['default'](this.$db)
                    bookshelfModels = this.resources.map(function(resource) {
                        var hiddenFields = resource
                            .serialize()
                            .fields.filter(function(field) {
                                return field.hidden
                            })
                            .map(function(field) {
                                return field.databaseField
                            })
                        var model = {
                            hidden: hiddenFields,
                            tableName: resource.data.table,
                            hasTimestamps: !resource.data.noTimeStamps
                        }
                        resource.data.fields.forEach(function(field) {
                            var relatedResource = _this.resources.find(function(
                                relatedResource
                            ) {
                                return field.name === relatedResource.data.name
                            })
                            if (!relatedResource) {
                                return
                            }
                            if (field.component === 'BelongsToField') {
                                model[
                                    relatedResource.data.name.toLowerCase()
                                ] = function() {
                                    return this.belongsTo(
                                        relatedResource.data.name
                                    )
                                }
                            }
                            if (field.component === 'HasManyField') {
                                model[relatedResource.data.slug] = function() {
                                    return this.hasMany(
                                        relatedResource.data.name
                                    )
                                }
                            }
                            if (field.component === 'BelongsToManyField') {
                                model[relatedResource.data.slug] = function() {
                                    return this.belongsToMany(
                                        relatedResource.data.name
                                    )
                                }
                            }
                        })
                        var modelInstance = bookshelfInstance.model(
                            resource.data.name,
                            model
                        )
                        modelInstance.resourceName = resource.data.name
                        return modelInstance
                    })
                    this.bookshelfModels = bookshelfModels
                    return [2 /*return*/]
                })
            })
        }
        this.handleBelongsToManyField = function(
            trx,
            resources,
            resource,
            schema
        ) {
            return __awaiter(_this, void 0, void 0, function() {
                var belongsToManyFields, _loop_1, index, state_1
                return __generator(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            belongsToManyFields = resource.fields.filter(
                                function(field) {
                                    return (
                                        field.component === 'BelongsToManyField'
                                    )
                                }
                            )
                            _loop_1 = function(index) {
                                var field,
                                    relatedResource,
                                    indexOfResource,
                                    indexOfRelatedResource,
                                    migrationHasAlreadyBeenRunForRelatedField,
                                    tableName,
                                    resourceColumnName_1,
                                    relatedResourceColumnName_1,
                                    tableExists_1,
                                    resourceColumnExists_1,
                                    relatedResourceColumnExists_1
                                return __generator(this, function(_a) {
                                    switch (_a.label) {
                                        case 0:
                                            field = belongsToManyFields[index]
                                            if (
                                                !(
                                                    field.component ===
                                                    'BelongsToManyField'
                                                )
                                            )
                                                return [3 /*break*/, 2]
                                            relatedResource = resources.find(
                                                function(relatedResource) {
                                                    return (
                                                        field.name ===
                                                        relatedResource.name
                                                    )
                                                }
                                            )
                                            indexOfResource = resources.findIndex(
                                                function(indexResource) {
                                                    return (
                                                        resource.name ===
                                                        indexResource.name
                                                    )
                                                }
                                            )
                                            indexOfRelatedResource = resources.findIndex(
                                                function(relatedResource) {
                                                    return (
                                                        field.name ===
                                                        relatedResource.name
                                                    )
                                                }
                                            )
                                            migrationHasAlreadyBeenRunForRelatedField =
                                                indexOfResource <
                                                indexOfRelatedResource
                                            if (
                                                migrationHasAlreadyBeenRunForRelatedField
                                            ) {
                                                return [
                                                    2 /*return*/,
                                                    { value: void 0 }
                                                ]
                                            }
                                            if (!relatedResource) {
                                                console.warn(
                                                    'The BelongsToMany relationship is pointing to a resource called ' +
                                                        field.name +
                                                        ' which does not exist.'
                                                )
                                                return [
                                                    2 /*return*/,
                                                    { value: void 0 }
                                                ]
                                            }
                                            tableName = [
                                                pluralize_1['default'](
                                                    change_case_1.snakeCase(
                                                        relatedResource.name
                                                    )
                                                ),
                                                pluralize_1['default'](
                                                    change_case_1.snakeCase(
                                                        resource.name
                                                    )
                                                )
                                            ]
                                                .sort()
                                                .join('_')
                                            resourceColumnName_1 =
                                                change_case_1.snakeCase(
                                                    resource.name
                                                ) + '_id'
                                            relatedResourceColumnName_1 =
                                                change_case_1.snakeCase(
                                                    relatedResource.name
                                                ) + '_id'
                                            tableExists_1 = schema
                                                ? schema[tableName]
                                                : false
                                            resourceColumnExists_1 = tableExists_1
                                                ? schema[tableName][
                                                      resourceColumnName_1
                                                  ]
                                                : false
                                            relatedResourceColumnExists_1 = tableExists_1
                                                ? schema[tableName][
                                                      relatedResourceColumnName_1
                                                  ]
                                                : false
                                            return [
                                                4 /*yield*/,
                                                trx.schema[
                                                    tableExists_1
                                                        ? 'alterTable'
                                                        : 'createTable'
                                                ](tableName, function(t) {
                                                    if (!tableExists_1) {
                                                        t.increments()
                                                    }
                                                    var resourceMethod = t.integer(
                                                        resourceColumnName_1
                                                    )
                                                    var relatedResourceMethod = t.integer(
                                                        relatedResourceColumnName_1
                                                    )
                                                    if (
                                                        resourceColumnExists_1
                                                    ) {
                                                        resourceMethod.alter()
                                                    }
                                                    if (
                                                        relatedResourceColumnExists_1
                                                    ) {
                                                        relatedResourceMethod.alter()
                                                    }
                                                    if (!tableExists_1) {
                                                        t.timestamps()
                                                    }
                                                })
                                            ]
                                        case 1:
                                            _a.sent()
                                            _a.label = 2
                                        case 2:
                                            return [2 /*return*/]
                                    }
                                })
                            }
                            index = 0
                            _a.label = 1
                        case 1:
                            if (!(index < belongsToManyFields.length))
                                return [3 /*break*/, 4]
                            return [5 /*yield**/, _loop_1(index)]
                        case 2:
                            state_1 = _a.sent()
                            if (typeof state_1 === 'object')
                                return [2 /*return*/, state_1.value]
                            _a.label = 3
                        case 3:
                            index++
                            return [3 /*break*/, 1]
                        case 4:
                            return [2 /*return*/]
                    }
                })
            })
        }
        this.performDatabaseSchemaSync = function(resources) {
            if (resources === void 0) {
                resources = []
            }
            return __awaiter(_this, void 0, void 0, function() {
                var knex, schema
                var _this = this
                return __generator(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            knex = this.$db
                            return [4 /*yield*/, this.getDatabaseSchema()]
                        case 1:
                            schema = _a.sent()
                            return [
                                4 /*yield*/,
                                knex.transaction(function(trx) {
                                    return __awaiter(
                                        _this,
                                        void 0,
                                        void 0,
                                        function() {
                                            var _loop_2, this_1, index
                                            var _this = this
                                            return __generator(this, function(
                                                _a
                                            ) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _loop_2 = function(
                                                            index
                                                        ) {
                                                            var resource_1,
                                                                tableExists
                                                            return __generator(
                                                                this,
                                                                function(_a) {
                                                                    switch (
                                                                        _a.label
                                                                    ) {
                                                                        case 0:
                                                                            resource_1 =
                                                                                resources[
                                                                                    index
                                                                                ]
                                                                            tableExists = schema
                                                                                ? schema[
                                                                                      resource_1
                                                                                          .table
                                                                                  ]
                                                                                : false
                                                                            this_1.handleBelongsToManyField(
                                                                                trx,
                                                                                resources,
                                                                                resource_1,
                                                                                schema
                                                                            )
                                                                            return [
                                                                                4 /*yield*/,
                                                                                trx.schema[
                                                                                    tableExists
                                                                                        ? 'alterTable'
                                                                                        : 'createTable'
                                                                                ](
                                                                                    resource_1.table,
                                                                                    function(
                                                                                        t
                                                                                    ) {
                                                                                        // if column exists on schema, but cannot be found here on fields,
                                                                                        // then it should be dropped
                                                                                        resource_1.fields.forEach(
                                                                                            function(
                                                                                                field
                                                                                            ) {
                                                                                                if (
                                                                                                    field.component ===
                                                                                                    'HasManyField'
                                                                                                ) {
                                                                                                    return
                                                                                                }
                                                                                                if (
                                                                                                    field.component ===
                                                                                                    'BelongsToManyField'
                                                                                                ) {
                                                                                                    return
                                                                                                }
                                                                                                return _this.handleFieldUpdates(
                                                                                                    trx,
                                                                                                    t,
                                                                                                    schema,
                                                                                                    field,
                                                                                                    resource_1,
                                                                                                    resources
                                                                                                )
                                                                                            }
                                                                                        )
                                                                                        if (
                                                                                            !resource_1.noTimeStamps &&
                                                                                            !tableExists
                                                                                        ) {
                                                                                            t.timestamps(
                                                                                                true,
                                                                                                true
                                                                                            )
                                                                                        }
                                                                                    }
                                                                                )
                                                                            ]
                                                                        case 1:
                                                                            _a.sent()
                                                                            return [
                                                                                2 /*return*/
                                                                            ]
                                                                    }
                                                                }
                                                            )
                                                        }
                                                        this_1 = this
                                                        index = 0
                                                        _a.label = 1
                                                    case 1:
                                                        if (
                                                            !(
                                                                index <
                                                                resources.length
                                                            )
                                                        )
                                                            return [
                                                                3 /*break*/,
                                                                4
                                                            ]
                                                        return [
                                                            5 /*yield**/,
                                                            _loop_2(index)
                                                        ]
                                                    case 2:
                                                        _a.sent()
                                                        _a.label = 3
                                                    case 3:
                                                        index++
                                                        return [3 /*break*/, 1]
                                                    case 4:
                                                        return [2 /*return*/]
                                                }
                                            })
                                        }
                                    )
                                })
                            ]
                        case 2:
                            _a.sent()
                            return [2 /*return*/]
                    }
                })
            })
        }
        this.getDatabaseSchema = function() {
            return __awaiter(_this, void 0, void 0, function() {
                var _a, _b, _c, errors_1
                return __generator(this, function(_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 2, , 3])
                            _b = (_a = this.parseMysqlDatabaseSchema).apply
                            _c = [this]
                            return [
                                4 /*yield*/,
                                Promise.all([
                                    this.$db(
                                        'information_schema.columns'
                                    ).where(
                                        'table_schema',
                                        this.$db.client.config.connection
                                            .database
                                    ),
                                    this.$db(
                                        'information_schema.statistics'
                                    ).where(
                                        'table_schema',
                                        this.$db.client.config.connection
                                            .database
                                    )
                                ])
                            ]
                        case 1:
                            // TODO: Make sure this works for all supported databases. not just mysql.
                            return [
                                2 /*return*/,
                                _b.apply(_a, _c.concat([_d.sent()]))
                            ]
                        case 2:
                            errors_1 = _d.sent()
                            return [2 /*return*/, null]
                        case 3:
                            return [2 /*return*/]
                    }
                })
            })
        }
        this.handleFieldUpdates = function(
            trx,
            table,
            schema,
            field,
            resource,
            resources
        ) {
            if (schema === void 0) {
                schema = null
            }
            var knexMethodName = field.sqlDatabaseFieldType || ''
            var tableExists = schema ? schema[resource.table] : false
            // @ts-ignore
            if (
                !table[knexMethodName] &&
                table[knexMethodName] !== 'undefined'
            ) {
                console.warn(
                    'The field ' +
                        field.name +
                        ' is making use of an invalid database method ' +
                        field.sqlDatabaseFieldType +
                        '. Make sure this method is supported by knex.'
                )
                return
            }
            var matchingDatabaseField = tableExists
                ? schema[resource.table][field.databaseField]
                : null
            var columnHasIndex = matchingDatabaseField
                ? matchingDatabaseField.indexes.find(function(index) {
                      // TODO: If we allow custom index names in future, we'll check for the custom name here.
                      return (
                          index.INDEX_NAME ===
                          resource.table + '_' + field.databaseField + '_index'
                      )
                  })
                : false
            var columnIsUnique = matchingDatabaseField
                ? matchingDatabaseField.indexes.find(function(index) {
                      return (
                          index.INDEX_NAME ===
                          resource.table + '_' + field.databaseField + '_unique'
                      )
                  })
                : false
            // first let's handle all indexes. this includes primary keys, unique keys and search indexes
            // next, let's handle
            if (['increments', 'bigIncrements'].includes(knexMethodName)) {
                if (!tableExists) {
                    // @ts-ignore
                    table[knexMethodName](field.databaseField)
                }
                return
            }
            var methodArguments = [field.databaseField]
            if (knexMethodName === 'enu') {
                var selectOptions = field.selectOptions.map(function(option) {
                    return option.value
                })
                methodArguments = [field.databaseField, selectOptions]
            }
            // @ts-ignore
            var method = table[knexMethodName].apply(table, methodArguments)
            // if old was unique, and new is not unique, drop unique
            if (columnIsUnique && !field.isUnique) {
                table.dropUnique(matchingDatabaseField.name)
            }
            if (columnHasIndex && !field.isSearchable) {
                table.dropIndex(matchingDatabaseField.name)
            }
            if (
                field.defaultValue &&
                !['datetime', 'date', 'time'].includes(knexMethodName)
            ) {
                method.defaultTo(field.defaultValue)
            }
            if (knexMethodName === 'datetime' && field.defaultToNow) {
                method.defaultTo(trx.fn.now())
            }
            if (field.isUnsigned) {
                method.unsigned()
            }
            if (field.isSearchable && !columnHasIndex) {
                table.index(field.databaseField)
            }
            if (field.isUnique && !columnIsUnique) {
                method.unique()
            }
            if (field.isNullable === true) {
                method.nullable()
            } else {
                method.notNullable()
            }
            // if field already exists, we'll attach .alter() to it.
            // this won't work for sqlite, sigh.
            if (matchingDatabaseField) {
                method.alter()
            }
        }
        this.parseMysqlDatabaseSchema = function(schema, schemaStatistics) {
            if (schemaStatistics === void 0) {
                schemaStatistics = []
            }
            var tables = {}
            schema.forEach(function(column) {
                var _a
                var fieldType = column.DATA_TYPE
                var indexes =
                    schemaStatistics.filter(function(columnData) {
                        return column.COLUMN_NAME === columnData.COLUMN_NAME
                    }) || []
                tables[column.TABLE_NAME] = __assign(
                    __assign({}, tables[column.TABLE_NAME] || {}),
                    ((_a = {}),
                    (_a[column.COLUMN_NAME] = {
                        fieldType: fieldType,
                        indexes: indexes,
                        name: column.COLUMN_NAME,
                        isPrimaryKey: column.COLUMN_KEY === 'PRI',
                        isNullable: column.IS_NULLABLE === 'YES',
                        isUnique: column.COLUMN_KEY === 'UNI',
                        numericPrecision: column.NUMERIC_PRECISION,
                        autoIncrements: !!column.EXTRA.match(/auto_increment/),
                        unsigned: !!column.COLUMN_TYPE.match(/unsigned/)
                    }),
                    _a)
                )
            })
            return tables
        }
        this.findUserByEmail = function(email) {
            return __awaiter(_this, void 0, void 0, function() {
                return __generator(this, function(_a) {
                    return [
                        2 /*return*/,
                        this.$db('administrators')
                            .where('email', email)
                            .limit(1)
                            .then(function(_a) {
                                var administrator = _a[0]
                                return administrator || null
                            })
                    ]
                })
            })
        }
        this.getAdministratorsCount = function() {
            return __awaiter(_this, void 0, void 0, function() {
                return __generator(this, function(_a) {
                    return [
                        2 /*return*/,
                        this.$db('administrators')
                            .count()
                            .then(function(_a) {
                                var count = _a[0]
                                return parseInt(count['count(*)'])
                            })
                    ]
                })
            })
        }
        this.create = function(resource, payload, relationshipPayload) {
            return __awaiter(_this, void 0, void 0, function() {
                var Model, result, relationshipFields
                var _this = this
                return __generator(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            Model = this.getResourceBookshelfModel(resource)
                            return [4 /*yield*/, Model.forge(payload).save()]
                        case 1:
                            result = _a.sent()
                            relationshipFields = resource
                                .serialize()
                                .fields.filter(function(field) {
                                    return field.isRelationshipField
                                })
                            return [
                                4 /*yield*/,
                                Promise.all(
                                    relationshipFields.map(function(field) {
                                        var relatedResource = _this.resources.find(
                                            function(relatedResource) {
                                                return (
                                                    relatedResource.data
                                                        .name === field.name
                                                )
                                            }
                                        )
                                        if (!relatedResource) {
                                            return Promise.resolve()
                                        }
                                        if (
                                            field.component ===
                                                'BelongsToManyField' &&
                                            relationshipPayload[
                                                field.databaseField
                                            ]
                                        ) {
                                            var builder = new Model({
                                                id: result.id
                                            })
                                            return builder[
                                                relatedResource.data.slug
                                            ]().attach(
                                                relationshipPayload[
                                                    field.databaseField
                                                ]
                                            )
                                        }
                                        return Promise.resolve()
                                    })
                                )
                            ]
                        case 2:
                            _a.sent()
                            return [2 /*return*/, result]
                    }
                })
            })
        }
        this.update = function(
            resource,
            id,
            payload,
            relationshipPayload,
            patch
        ) {
            if (payload === void 0) {
                payload = {}
            }
            if (relationshipPayload === void 0) {
                relationshipPayload = {}
            }
            if (patch === void 0) {
                patch = true
            }
            return __awaiter(_this, void 0, void 0, function() {
                var Model, result, relationshipFields
                var _this = this
                return __generator(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            Model = this.getResourceBookshelfModel(resource)
                            return [
                                4 /*yield*/,
                                Model.where({
                                    id: id
                                }).save(payload, {
                                    patch: patch,
                                    autoRefresh: true
                                })
                            ]
                        case 1:
                            result = _a.sent()
                            relationshipFields = resource
                                .serialize()
                                .fields.filter(function(field) {
                                    return field.isRelationshipField
                                })
                            return [
                                4 /*yield*/,
                                Promise.all(
                                    relationshipFields.map(function(field) {
                                        var relatedResource = _this.resources.find(
                                            function(relatedResource) {
                                                return (
                                                    relatedResource.data
                                                        .name === field.name
                                                )
                                            }
                                        )
                                        if (!relatedResource) {
                                            return Promise.resolve()
                                        }
                                        var RelatedModel = _this.getResourceBookshelfModel(
                                            relatedResource
                                        )
                                        if (
                                            field.component ===
                                                'BelongsToManyField' &&
                                            relationshipPayload[
                                                field.databaseField
                                            ]
                                        ) {
                                            var builder_1 = new Model({
                                                id: result.id
                                            })
                                            return (function() {
                                                return __awaiter(
                                                    _this,
                                                    void 0,
                                                    void 0,
                                                    function() {
                                                        return __generator(
                                                            this,
                                                            function(_a) {
                                                                switch (
                                                                    _a.label
                                                                ) {
                                                                    case 0:
                                                                        return [
                                                                            4 /*yield*/,
                                                                            builder_1[
                                                                                relatedResource
                                                                                    .data
                                                                                    .slug
                                                                            ]().detach()
                                                                        ]
                                                                    case 1:
                                                                        _a.sent()
                                                                        return [
                                                                            4 /*yield*/,
                                                                            builder_1[
                                                                                relatedResource
                                                                                    .data
                                                                                    .slug
                                                                            ]().attach(
                                                                                relationshipPayload[
                                                                                    field
                                                                                        .databaseField
                                                                                ]
                                                                            )
                                                                        ]
                                                                    case 2:
                                                                        _a.sent()
                                                                        return [
                                                                            2 /*return*/
                                                                        ]
                                                                }
                                                            }
                                                        )
                                                    }
                                                )
                                            })()
                                        }
                                        if (
                                            field.component ===
                                                'HasManyField' &&
                                            relationshipPayload[
                                                field.databaseField
                                            ]
                                        ) {
                                            var relatedBelongsToField_1 = relatedResource.data.fields.find(
                                                function(field) {
                                                    return (
                                                        field.component ===
                                                            'BelongsToField' &&
                                                        field.name ===
                                                            resource.data.name
                                                    )
                                                }
                                            )
                                            if (!relatedBelongsToField_1) {
                                                console.warn(
                                                    'You must define the corresponding BelongsTo relationship for the ' +
                                                        resource.data.name +
                                                        '.'
                                                )
                                                return
                                            }
                                            return (function() {
                                                return __awaiter(
                                                    this,
                                                    void 0,
                                                    void 0,
                                                    function() {
                                                        var _a, _b
                                                        return __generator(
                                                            this,
                                                            function(_c) {
                                                                switch (
                                                                    _c.label
                                                                ) {
                                                                    case 0:
                                                                        return [
                                                                            4 /*yield*/,
                                                                            RelatedModel.query()
                                                                                .where(
                                                                                    relatedBelongsToField_1.databaseField,
                                                                                    id
                                                                                )
                                                                                .update(
                                                                                    ((_a = {}),
                                                                                    (_a[
                                                                                        relatedBelongsToField_1.databaseField
                                                                                    ] = null),
                                                                                    _a)
                                                                                )
                                                                        ]
                                                                    case 1:
                                                                        _c.sent()
                                                                        return [
                                                                            4 /*yield*/,
                                                                            RelatedModel.query()
                                                                                .whereIn(
                                                                                    'id',
                                                                                    relationshipPayload[
                                                                                        field
                                                                                            .databaseField
                                                                                    ]
                                                                                )
                                                                                .update(
                                                                                    ((_b = {}),
                                                                                    (_b[
                                                                                        relatedBelongsToField_1.databaseField
                                                                                    ] =
                                                                                        result.id),
                                                                                    _b)
                                                                                )
                                                                        ]
                                                                    case 2:
                                                                        _c.sent()
                                                                        return [
                                                                            2 /*return*/
                                                                        ]
                                                                }
                                                            }
                                                        )
                                                    }
                                                )
                                            })()
                                        }
                                        return Promise.resolve()
                                    })
                                )
                            ]
                        case 2:
                            _a.sent()
                            return [2 /*return*/, result]
                    }
                })
            })
        }
        this.updateManyByIds = function(resource, ids, valuesToUpdate) {
            return __awaiter(_this, void 0, void 0, function() {
                return __generator(this, function(_a) {
                    return [
                        2 /*return*/,
                        this.$db(resource.data.table)
                            .whereIn('id', ids)
                            .update(valuesToUpdate)
                    ]
                })
            })
        }
        this.updateManyWhere = function(resource, whereClause, valuesToUpdate) {
            return __awaiter(_this, void 0, void 0, function() {
                return __generator(this, function(_a) {
                    return [
                        2 /*return*/,
                        this.$db(resource.data.table)
                            .where(whereClause)
                            .update(valuesToUpdate)
                    ]
                })
            })
        }
        this.deleteById = function(resource, id) {
            return __awaiter(_this, void 0, void 0, function() {
                var result
                return __generator(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            return [
                                4 /*yield*/,
                                this.$db(resource.data.table)
                                    .where('id', id)
                                    .limit(1)
                                    ['delete']()
                            ]
                        case 1:
                            result = _a.sent()
                            if (result === 0) {
                                throw [
                                    {
                                        message:
                                            resource.data.name +
                                            ' resource with id ' +
                                            id +
                                            ' was not found.'
                                    }
                                ]
                            }
                            return [2 /*return*/, result]
                    }
                })
            })
        }
        this.findAllByIds = function(resource, ids, fields) {
            return __awaiter(_this, void 0, void 0, function() {
                return __generator(this, function(_a) {
                    return [
                        2 /*return*/,
                        this.$db
                            .select(fields || '*')
                            .from(resource.data.table)
                            .whereIn('id', ids)
                    ]
                })
            })
        }
        this.findOneById = function(resource, id, fields, withRelated) {
            if (withRelated === void 0) {
                withRelated = []
            }
            return __awaiter(_this, void 0, void 0, function() {
                var Model, result
                return __generator(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            Model = this.getResourceBookshelfModel(resource)
                            return [
                                4 /*yield*/,
                                new Model({ id: id }).fetch({
                                    require: false,
                                    columns: fields,
                                    withRelated: withRelated
                                })
                            ]
                        case 1:
                            result = _a.sent()
                            return [2 /*return*/, result]
                    }
                })
            })
        }
        this.findOneByField = function(resource, field, value, fields) {
            return __awaiter(_this, void 0, void 0, function() {
                return __generator(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            return [
                                4 /*yield*/,
                                this.$db
                                    .select(fields || '*')
                                    .from(resource.data.table)
                                    .where(field, value)
                                    .limit(1)
                            ]
                        case 1:
                            return [2 /*return*/, _a.sent()[0] || null]
                    }
                })
            })
        }
        this.findOneByFieldExcludingOne = function(
            resource,
            field,
            value,
            excludeId,
            fields
        ) {
            return __awaiter(_this, void 0, void 0, function() {
                return __generator(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            return [
                                4 /*yield*/,
                                this.$db
                                    .select(fields || '*')
                                    .from(resource.data.table)
                                    .where(field, value)
                                    .whereNot('id', excludeId)
                                    .limit(1)
                            ]
                        case 1:
                            return [2 /*return*/, _a.sent()[0] || null]
                    }
                })
            })
        }
        this.findAllBelongingToMany = function(
            resource,
            relatedResource,
            resourceId,
            query
        ) {
            return __awaiter(_this, void 0, void 0, function() {
                var Model,
                    getBuilder,
                    resourceColumnName,
                    relatedResourceColumnName,
                    tableName,
                    count,
                    data
                var _a
                var _this = this
                return __generator(this, function(_b) {
                    switch (_b.label) {
                        case 0:
                            Model = this.getResourceBookshelfModel(resource)
                            getBuilder = function(builder) {
                                if (query.search) {
                                    var searchableFields_1 = relatedResource.data.fields.filter(
                                        function(field) {
                                            return field.isSearchable
                                        }
                                    )
                                    builder.where(function(qb) {
                                        searchableFields_1.forEach(function(
                                            field,
                                            index
                                        ) {
                                            qb[
                                                index === 0
                                                    ? 'where'
                                                    : 'orWhere'
                                            ](
                                                relatedResource.data.table +
                                                    '.' +
                                                    field.databaseField,
                                                'like',
                                                '%' +
                                                    query.search.toLowerCase() +
                                                    '%'
                                            )
                                        })
                                    })
                                }
                                builder = _this.handleFilterQueries(
                                    query.filters,
                                    builder
                                )
                                return builder
                            }
                            resourceColumnName =
                                change_case_1.snakeCase(resource.data.name) +
                                '_id'
                            relatedResourceColumnName =
                                change_case_1.snakeCase(
                                    relatedResource.data.name
                                ) + '_id'
                            tableName = [
                                pluralize_1['default'](
                                    change_case_1.snakeCase(
                                        relatedResource.data.name
                                    )
                                ),
                                pluralize_1['default'](
                                    change_case_1.snakeCase(resource.data.name)
                                )
                            ]
                                .sort()
                                .join('_')
                            return [
                                4 /*yield*/,
                                getBuilder(
                                    this.$db(relatedResource.data.table)
                                        .count()
                                        .innerJoin(
                                            tableName,
                                            tableName +
                                                '.' +
                                                relatedResourceColumnName,
                                            relatedResource.data.table + '.id'
                                        )
                                ).andWhere(
                                    tableName + '.' + resourceColumnName,
                                    resourceId
                                )
                            ]
                        case 1:
                            count = _b.sent()[0]['count(*)']
                            return [
                                4 /*yield*/,
                                Model.forge({
                                    id: resourceId
                                }).fetch({
                                    withRelated: [
                                        ((_a = {}),
                                        (_a[
                                            relatedResource.data.slug
                                        ] = function(builder) {
                                            return getBuilder(builder)
                                                .select(
                                                    query.fields.map(function(
                                                        field
                                                    ) {
                                                        return (
                                                            relatedResource.data
                                                                .table +
                                                            '.' +
                                                            field
                                                        )
                                                    })
                                                )
                                                .limit(query.perPage)
                                                .offset(
                                                    (query.page - 1) *
                                                        query.perPage
                                                )
                                        }),
                                        _a)
                                    ]
                                })
                            ]
                        case 2:
                            data = _b.sent()
                            return [
                                2 /*return*/,
                                {
                                    page: query.page,
                                    perPage: query.perPage,
                                    total: count,
                                    pageCount: Math.ceil(count / query.perPage),
                                    data:
                                        data.relations[
                                            relatedResource.data.slug
                                        ].models
                                }
                            ]
                    }
                })
            })
        }
        this.handleFilterQueries = function(filters, builder) {
            filters.forEach(function(filter) {
                if (filter.operator === 'null') {
                    builder.whereNull(filter.field)
                    return
                }
                if (filter.operator === 'not_null') {
                    builder.whereNotNull(filter.field)
                    return
                }
                if (filter.operator === 'gt') {
                    builder.where(filter.field, '>', filter.value)
                    return
                }
                if (filter.operator === 'gte') {
                    builder.where(filter.field, '>=', filter.value)
                    return
                }
                if (filter.operator === 'lt') {
                    builder.where(filter.field, '<', filter.value)
                    return
                }
                if (filter.operator === 'lte') {
                    builder.where(filter.field, '<=', filter.value)
                    return
                }
                if (filter.operator === 'contains') {
                    builder.where(
                        filter.field,
                        'like',
                        '%' + filter.value + '%'
                    )
                    return
                }
                if (filter.operator === 'equals') {
                    builder.where(filter.field, '=', filter.value)
                    return
                }
                if (filter.operator === 'not_equals') {
                    builder.whereNot(filter.field, '=', filter.value)
                    return
                }
            })
            return builder
        }
        this.findAll = function(resource, query) {
            return __awaiter(_this, void 0, void 0, function() {
                var Model, getBuilder, count, data, results, total
                var _this = this
                return __generator(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            Model = this.getResourceBookshelfModel(resource)
                            getBuilder = function() {
                                var builder = Model.query()
                                if (query.search) {
                                    var searchableFields_2 = resource.data.fields.filter(
                                        function(field) {
                                            return field.isSearchable
                                        }
                                    )
                                    builder.where(function(qb) {
                                        searchableFields_2.forEach(function(
                                            field,
                                            index
                                        ) {
                                            qb[
                                                index === 0
                                                    ? 'where'
                                                    : 'orWhere'
                                            ](
                                                field.databaseField,
                                                'like',
                                                '%' +
                                                    query.search.toLowerCase() +
                                                    '%'
                                            )
                                        })
                                    })
                                }
                                builder = _this.handleFilterQueries(
                                    query.filters,
                                    builder
                                )
                                return builder
                            }
                            return [4 /*yield*/, getBuilder().count()]
                        case 1:
                            count = _a.sent()
                            data = getBuilder()
                            return [
                                4 /*yield*/,
                                data
                                    .select(query.fields || '*')
                                    .limit(query.perPage)
                                    .offset((query.page - 1) * query.perPage)
                            ]
                        case 2:
                            results = _a.sent()
                            total = count[0]['count(*)']
                            return [
                                2 /*return*/,
                                {
                                    total: total,
                                    data: results,
                                    page: query.page,
                                    perPage: query.perPage,
                                    pageCount: Math.ceil(total / query.perPage)
                                }
                            ]
                    }
                })
            })
        }
    }
    SqlRepository.databases = ['mysql', 'pg']
    return SqlRepository
})()
exports.SqlRepository = SqlRepository
