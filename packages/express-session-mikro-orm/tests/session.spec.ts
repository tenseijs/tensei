import Path from 'path'
import Fs from 'fs'
import { assert, expect } from 'chai'
import { MikroORM, EntitySchema } from '@mikro-orm/core'
import expressSession from 'express-session'
import MikroOrmSession, { generateSessionEntity } from '../src/index'

const dbPath = Path.resolve(__dirname, '..', 'express-session-mikro-orm.sqlite')

const getOrmInstance = () =>
    MikroORM.init({
        type: 'sqlite',
        dbName: 'express-session-mikro-orm.sqlite',
        entities: [new EntitySchema(generateSessionEntity() as any)]
    })

const sampleSession =
    '{"user": 1, "cookie": {"path": "/", "expires": "2020-12-04T17:19:09.946Z", "httpOnly": true, "originalMaxAge": 2592000000}}'

const cleanupDatabase = () =>
    Fs.existsSync(dbPath)
        ? Fs.unlinkSync(
              Path.resolve(__dirname, '..', 'express-session-mikro-orm.sqlite')
          )
        : void it('can initialize session store correctly', async () => {
              const Store = MikroOrmSession(expressSession.Store)
              const orm = await getOrmInstance()

              assert.isDefined(
                  new Store({
                      orm
                  })
              )

              await orm.close(true)
          })

it('throws an error if the orm instance is not passed in to store', async () => {
    const Store = MikroOrmSession(expressSession.Store)

    expect(
        () =>
            new Store({
                orm: undefined
            })
    ).to.throw('A Mikro ORM instance is required.')
})

it('The SessionStore.get() gets a session by id', done => {
    const Store = MikroOrmSession(expressSession.Store)

    getOrmInstance().then(orm => {
        orm.getSchemaGenerator()
            .updateSchema()
            .then(() =>
                orm.em
                    .persistAndFlush(
                        orm.em.create('Session', {
                            session_id: 1,
                            data: sampleSession,
                            expires: new Date()
                        })
                    )
                    .then(() => {
                        const store = new Store({
                            orm
                        })

                        store.get(1, (error: any, value: any) => {
                            expect(error).to.be.null
                            expect(value.cookie.originalMaxAge).to.eq(
                                2592000000
                            )

                            orm.close().then(() => {
                                done()
                            })
                        })
                    })
            )
            .catch(console.error)
    })
})

it('The SessionStore.getAll() gets all sessions in database', done => {
    const Store = MikroOrmSession(expressSession.Store)

    getOrmInstance().then(orm => {
        orm.getSchemaGenerator()
            .updateSchema()
            .then(() =>
                orm.em
                    .persistAndFlush(
                        [
                            {
                                session_id: 1,
                                data: sampleSession,
                                expires: new Date()
                            },
                            {
                                session_id: 2,
                                data: sampleSession,
                                expires: new Date()
                            },
                            {
                                session_id: 3,
                                data: sampleSession,
                                expires: new Date()
                            }
                        ].map(object => orm.em.create('Session', object))
                    )
                    .then(() => {
                        const store = new Store({
                            orm
                        })

                        store.getAll((error: any, value: any) => {
                            expect(error).to.be.null
                            expect(value.length).to.eq(3)
                            expect(value[0].session_id).to.eq(1)
                            expect(value[1].session_id).to.eq(2)
                            expect(value[2].session_id).to.eq(3)

                            orm.close().then(() => {
                                done()
                            })
                        })
                    })
                    .catch(console.log)
            )
            .catch(console.error)
    })
})

it('The SessionStore.set() updates existing session', done => {
    const Store = MikroOrmSession(expressSession.Store)

    getOrmInstance().then(orm => {
        orm.getSchemaGenerator()
            .updateSchema()
            .then(() =>
                orm.em
                    .persistAndFlush(
                        orm.em.create('Session', {
                            session_id: 3,
                            data: sampleSession,
                            expires: new Date()
                        })
                    )
                    .then(() => {
                        const store = new Store({
                            orm
                        })

                        const updatedSession = {
                            ...JSON.parse(sampleSession),
                            user: 20,
                            cookie: {
                                ...JSON.parse(sampleSession).cookie,
                                path: '/updated-path'
                            }
                        }

                        store.set(
                            3,
                            updatedSession,
                            (error: any, value: any) => {
                                expect(error).to.be.null

                                expect(value.session_id).to.eq(3)
                                const parsedSession = JSON.parse(value.data)
                                expect(parsedSession.user).to.eq(
                                    updatedSession.user
                                )
                                expect(parsedSession.cookie.path).to.eq(
                                    updatedSession.cookie.path
                                )

                                orm.close().then(() => {
                                    done()
                                })
                            }
                        )
                    })
                    .catch(console.log)
            )
            .catch(console.error)
    })
})

it('The SessionStore.set() creates new session if session with sid does not exist', done => {
    const Store = MikroOrmSession(expressSession.Store)

    getOrmInstance().then(orm => {
        orm.getSchemaGenerator()
            .updateSchema()
            .then(() => {
                const store = new Store({
                    orm
                })

                const session = {
                    ...JSON.parse(sampleSession),
                    user: 20,
                    cookie: {
                        ...JSON.parse(sampleSession).cookie,
                        path: '/updated-path'
                    }
                }

                store.set(3, session, (error: any, value: any) => {
                    expect(error).to.be.null

                    expect(value.session_id).to.eq(3)
                    const parsedSession = JSON.parse(value.data)
                    expect(parsedSession.user).to.eq(session.user)
                    expect(parsedSession.cookie.path).to.eq(session.cookie.path)

                    orm.close().then(() => {
                        done()
                    })
                })
            })
            .catch(console.error)
    })
})

it('The SessionStore.destroy() destroys existing session', done => {
    const Store = MikroOrmSession(expressSession.Store)

    getOrmInstance().then(orm => {
        orm.getSchemaGenerator()
            .updateSchema()
            .then(() =>
                orm.em
                    .persistAndFlush(
                        orm.em.create('Session', {
                            session_id: 3,
                            data: sampleSession,
                            expires: new Date()
                        })
                    )
                    .then(() => {
                        const store = new Store({
                            orm
                        })

                        store.destroy(3, (error: any, value: any) => {
                            expect(error).to.be.null

                            orm.em
                                .findOne('Session', {
                                    session_id: 3
                                })
                                .then(foundSession => {
                                    expect(foundSession).to.be.null

                                    orm.close().then(() => {
                                        done()
                                    })
                                })
                        })
                    })
                    .catch(console.log)
            )
            .catch(console.error)
    })
})

it('The SessionStore.touch() updates expires field when session is touched', done => {
    const Store = MikroOrmSession(expressSession.Store)

    getOrmInstance().then(orm => {
        orm.getSchemaGenerator()
            .updateSchema()
            .then(() =>
                orm.em
                    .persistAndFlush(
                        orm.em.create('Session', {
                            session_id: 3,
                            data: sampleSession,
                            expires: new Date('2018-01-01')
                        })
                    )
                    .then(() => {
                        const store = new Store({
                            orm
                        })

                        const expiresDate = new Date()

                        store
                            .touch(
                                3,
                                {
                                    cookie: {
                                        expires: expiresDate
                                    }
                                },
                                (error: any, value: any) => {
                                    expect(error).to.be.null
                                    expect(value).to.be.null

                                    orm.em.clear()

                                    orm.em
                                        .findOne('Session', {
                                            session_id: 3
                                        })
                                        .then((foundSession: any) => {
                                            expect(
                                                foundSession.expires.toDateString()
                                            ).to.eq(expiresDate.toDateString())

                                            orm.close().then(() => {
                                                done()
                                            })
                                        })
                                        .catch(console.log)
                                }
                            )
                            .catch(console.error)
                    })
                    .catch(console.log)
            )
            .catch(console.error)
    })
})

it('The SessionStore.clearExpiredSessions() deletes all expired sessions', done => {
    const Store = MikroOrmSession(expressSession.Store)

    getOrmInstance().then(orm => {
        orm.getSchemaGenerator()
            .updateSchema()
            .then(() =>
                orm.em
                    .persistAndFlush(
                        [
                            {
                                session_id: 1,
                                data: sampleSession,
                                expires: new Date('2018-01-01')
                            },
                            {
                                session_id: 2,
                                data: sampleSession,
                                expires: new Date('2018-01-01')
                            },
                            {
                                session_id: 3,
                                data: sampleSession,
                                expires: new Date('2099-01-01')
                            }
                        ].map(object => orm.em.create('Session', object))
                    )
                    .then(() => {
                        const store = new Store({
                            orm
                        })

                        store.clearExpiredSessions().then(() => {
                            orm.em.find('Session', {}).then(foundSessions => {
                                expect(foundSessions.length).to.eq(1)

                                orm.close().then(() => {
                                    done()
                                })
                            }).catch(console.error)
                        }).catch(console.error)
                    })
                    .catch(console.log)
            )
            .catch(console.error)
    })
})

afterEach(() => cleanupDatabase())
