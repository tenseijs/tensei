import { MikroORM } from '@mikro-orm/core'
import { SessionConfig } from './types'

const StoreFactory = (Store: any, sessionConfig?: SessionConfig) => {
    const Parent = Store.Store ? Store.Store : Store

    return class SessionStore extends Parent {
        orm: MikroORM
        options: any
        entityName: string = 'Session'

        constructor(options: any = {}) {
            super(options)

            if (!options.orm) {
                throw new Error(`A Mikro ORM instance is required.`)
            }

            const connectOptions = {
                ...options,
                expiration: options.expiration || 24 * 60 * 60 * 1000,
                checkExpirationInterval:
                    options.checkExpirationInterval || 15 * 60 * 1000
            }

            this.options = {
                ...connectOptions,
                tableName: connectOptions.tableName || 'sessions',
                sync:
                    connectOptions.sync === undefined
                        ? true
                        : connectOptions.sync
            }
            this.orm = options.orm
            this.syncDatabase()
            this.startExpiringSessions()

            if (sessionConfig && sessionConfig.entityName) {
                this.entityName = sessionConfig.entityName
            }
        }

        syncDatabase = async () => {
            if (!this.options.sync || this.orm.config.get('type') === 'mongo') {
                return
            }

            // @ts-ignore
            const qb = this.orm.em.getKnex()

            const tableExists = await qb.schema.hasTable(this.options.tableName)

            if (!tableExists) {
                await qb.schema.createTable(
                    this.options.tableName,
                    (table: any) => {
                        table.string('session_id').primary()
                        table.datetime('expires').nullable().index()
                        table.text('data').notNullable()
                    }
                )
            }
        }

        get = (sid: string | number, callback: any) => {
            return this.orm.em
                .findOne(this.entityName, {
                    session_id: sid
                })
                .then((value: any) => (value ? JSON.parse(value.data) : null))
                .then(value => callback(null, value))
                .catch(error => callback(error, null))
        }
        getAll = (callback: any) => {
            return this.orm.em
                .find(this.entityName, {})
                .then(sessions =>
                    sessions.map((session: any) => session.toJSON())
                )
                .then(sessions => callback(null, sessions))
                .catch(error => callback(error, null))
        }
        set = (sid: string | number, data: any, callback: any) => {
            let expires = new Date(Date.now() + this.options.expiration)

            const payload = {
                ...data,
                expires
            }

            if (payload.cookie && payload.cookie.expires) {
                expires = payload.cookie.expires
            }

            return this.orm.em
                .findOne(this.entityName, {
                    session_id: sid
                })
                .then((session: any) => {
                    if (session) {
                        this.orm.em.assign(session, {
                            data: JSON.stringify(payload),
                            expires
                        })

                        return this.orm.em
                            .persistAndFlush(session)
                            .then(() => session)
                    }

                    const newSession = this.orm.em.create(this.entityName, {
                        session_id: sid,
                        data: JSON.stringify(payload),
                        expires
                    })

                    return this.orm.em
                        .persistAndFlush(newSession)
                        .then(() => newSession)
                })
                .then(value => callback(null, value))
                .catch(error => callback(error, null))
        }
        destroy = (sid: string | number, callback: any) => {
            return this.orm.em
                .findOne(this.entityName, {
                    session_id: sid
                })
                .then(session => {
                    if (session) {
                        return this.orm.em
                            .removeAndFlush(session)
                            .then(() => session)
                    }

                    return null
                })
                .then(() => callback(null))
                .catch(error => callback(error))
        }
        touch = (sid: string | number, data: any, callback: any) => {
            let expires = new Date(Date.now() + this.options.expiration)

            if (data.cookie && data.cookie.expires) {
                expires = data.cookie.expires
            }

            return this.orm.em
                .nativeUpdate(
                    this.entityName,
                    {
                        session_id: sid
                    },
                    {
                        expires
                    }
                )
                .then(() => callback(null, null))
                .catch((error: any) => callback(error, null))
        }
        startExpiringSessions = () => {
            this.expirationInterval = setInterval(
                this.clearExpiredSessions,
                this.options.checkExpirationInterval
            )
        }
        clearExpiredSessions = () => {
            return this.orm.em.nativeDelete(this.entityName, {
                expires: {
                    $lt: new Date()
                }
            })
        }
    }
}

export default StoreFactory

export { default as generateSessionEntity } from './models/Session'

module.exports.StoreFactory = StoreFactory
