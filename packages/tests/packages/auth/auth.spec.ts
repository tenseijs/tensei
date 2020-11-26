import { setup, gql, fakeUser, setupFakeMailer } from './setup'
import Supertest from 'supertest'
import { auth } from '@tensei/auth'
import { graphql } from '@tensei/graphql'
import { text } from '@tensei/common'

test('Registers auth resources when plugin is registered', async () => {
    const {
        ctx: { resources }
    } = await setup([auth().plugin()])

    expect(
        resources.find(resource => resource.data.name === 'User')
    ).toBeDefined()
})

test('Can customize the name of the authenticator user', async () => {
    const {
        ctx: { resources }
    } = await setup([
        auth()
            .user('Customer')
            .plugin()
    ])

    expect(
        resources.find(resource => resource.data.name === 'Customer')
    ).toBeDefined()
})

test('Enabling roles and permissions registers Role and permission resources', async () => {
    const {
        ctx: { resources }
    } = await setup([
        auth()
            .rolesAndPermissions()
            .plugin()
    ])

    expect(
        resources.filter(resource =>
            ['Role', 'Permission'].includes(resource.data.name)
        )
    ).toHaveLength(2)
})

test('Can customize role and permission names', async () => {
    const {
        ctx: { resources }
    } = await setup([
        auth()
            .rolesAndPermissions()
            .role('Department')
            .permission('Power')
            .plugin()
    ])

    expect(
        resources.filter(resource =>
            ['Department', 'Power'].includes(resource.data.name)
        )
    ).toHaveLength(2)
})

test('Can add new fields to the user resource using the setup function', async () => {
    const description = 'All departments have this description.'

    const {
        ctx: { orm }
    } = await setup([
        auth()
            .rolesAndPermissions()
            .role('Department')
            .permission('Power')
            .setup(({ role, user }) => {
                user.fields([text('Name')])
                role.fields([text('Description').nullable()]).beforeCreate(
                    async ({ entity, em }) => {
                        em.assign(entity, {
                            description
                        })
                    }
                )
            })
            .plugin()
    ])

    orm.em.create('Department', {
        name: 'Test department',
        slug: 'test-department'
    })

    await orm.em.persistAndFlush(
        orm.em.create('Department', {
            name: 'Test department',
            slug: 'test-department'
        })
    )

    expect(
        ((await orm.em.findOne('Department', {
            slug: 'test-department'
        })) as any).description
    ).toBe(description)
})

test('Can enable email verification for auth', async () => {
    const mailerMock = {
        send: jest.fn(),
        sendRaw: jest.fn()
    }

    const {
        ctx: {
            orm: { em },
            mailer
        },
        app
    } = await setup([
        auth()
            .user('Customer')
            .verifyEmails()
            .setup(({ user }) => {
                user.fields([text('Name')])
            })
            .plugin(),
        graphql().plugin(),
        setupFakeMailer(mailerMock)
    ])

    const client = Supertest(app)

    const user = fakeUser()

    const response = await client.post(`/graphql`).send({
        query: gql`
            mutation register_customer(
                $name: String!
                $email: String!
                $password: String!
            ) {
                register_customer(
                    object: { name: $name, email: $email, password: $password }
                ) {
                    access_token
                    refresh_token
                    customer {
                        id
                        email
                        email_verified_at
                    }
                }
            }
        `,
        variables: {
            name: user.full_name,
            email: user.email,
            password: user.password
        }
    })

    expect(response.status).toBe(200)
    expect(response.body.data.register_customer.access_token).toBeDefined()
    expect(response.body.data.register_customer.refresh_token).toBeDefined()

    const registeredCustomer: any = await em.findOne('Customer', {
        email: user.email
    })
    expect(response.body.data.register_customer.customer.id).toBe(
        registeredCustomer.id.toString()
    )
    expect(registeredCustomer.email_verification_token).toBeDefined()

    expect(mailer.sendRaw).toHaveBeenCalledWith(
        `Please verify your email using this link: ${registeredCustomer.email_verification_token}`
    )

    const verify_email_response = await client
        .post(`/graphql`)
        .send({
            query: gql`
                mutation confirm_email($email_verification_token: String!) {
                    confirm_email(
                        object: {
                            email_verification_token: $email_verification_token
                        }
                    ) {
                        id
                        email
                        email_verified_at
                    }
                }
            `,
            variables: {
                email_verification_token:
                    registeredCustomer.email_verification_token
            }
        })
        .set(
            'Authorization',
            `Bearer ${response.body.data.register_customer.access_token}`
        )

    expect(verify_email_response.body.data.confirm_email).toEqual({
        id: registeredCustomer.id.toString(),
        email: registeredCustomer.email,
        email_verified_at: expect.any(String)
    })
})

test('Can request a password reset and reset password', async () => {
    const mailerMock = {
        send: jest.fn(),
        sendRaw: jest.fn()
    }

    const {
        ctx: {
            orm: { em },
            mailer
        },
        app
    } = await setup([
        auth()
            .verifyEmails()
            .user('Student')
            .plugin(),
        graphql().plugin(),
        setupFakeMailer(mailerMock)
    ])

    const client = Supertest(app)

    const user = em.create('Student', fakeUser())

    await em.persistAndFlush(user)

    const response = await client.post(`/graphql`).send({
        query: gql`
            mutation request_password_reset($email: String!) {
                request_password_reset(object: { email: $email })
            }
        `,
        variables: {
            email: user.email
        }
    })

    expect(response.body).toEqual({ data: { request_password_reset: true } })

    const passwordReset: any = await em.findOne('PasswordReset', {
        email: user.email
    })

    const UPDATED_PASSWORD = 'UPDATED_PASSWORD'

    expect(passwordReset).not.toBe(null)

    const reset_password_response = await client.post(`/graphql`).send({
        query: gql`
            mutation reset_password(
                $email: String!
                $password: String!
                $token: String!
            ) {
                reset_password(
                    object: {
                        email: $email
                        token: $token
                        password: $password
                    }
                )
            }
        `,
        variables: {
            email: user.email,
            password: UPDATED_PASSWORD,
            token: passwordReset.token
        }
    })

    expect(reset_password_response.status).toBe(200)
    expect(reset_password_response.body).toEqual({
        data: { reset_password: true }
    })

    const login_response = await client.post(`/graphql`).send({
        query: gql`
            mutation login_student($email: String!, $password: String!) {
                login_student(object: { email: $email, password: $password }) {
                    access_token
                    refresh_token
                    student {
                        id
                        email
                    }
                }
            }
        `,
        variables: {
            password: UPDATED_PASSWORD,
            email: user.email
        }
    })

    expect(login_response.status).toBe(200)
    expect(login_response.body.data.login_student).toEqual({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
        student: {
            id: user.id.toString(),
            email: user.email
        }
    })
})

test('access tokens and refresh tokens are generated correctly', async done => {
    const jwtExpiresIn = 2 // in seconds
    const refreshTokenExpiresIn = 4 // in seconds

    const {
        ctx: {
            orm: { em }
        },
        app
    } = await setup([
        auth()
            .verifyEmails()
            .user('Student')
            .setup(({ user }) => {
                user.fields([text('Name').nullable()])
            })
            .configureTokens({
                accessTokenExpiresIn: jwtExpiresIn,
                refreshTokenExpiresIn
            })
            .plugin(),
        graphql().plugin()
    ])

    const client = Supertest(app)

    const user = em.create('Student', fakeUser())

    await em.persistAndFlush(user)

    const login_response = await client.post(`/graphql`).send({
        query: gql`
            mutation login_student($email: String!, $password: String!) {
                login_student(object: { email: $email, password: $password }) {
                    access_token
                    student {
                        id
                        email
                    }
                }
            }
        `,
        variables: {
            password: 'password',
            email: user.email
        }
    })

    const accessToken: string =
        login_response.body.data.login_student.access_token
    const refreshToken: string = login_response.headers['set-cookie'][0]
        .split(';')[0]
        .split('=')[1]

    setTimeout(async () => {
        // Wait for the jwt to expire, then run a test, make sure its invalid and fails.
        const authenticated_response = await client
            .post(`/graphql`)
            .send({
                query: gql`
                    query authenticated_student {
                        authenticated_student {
                            id
                            name
                            email
                        }
                    }
                `
            })
            .set('Authorization', `Bearer ${accessToken}`)

        expect(authenticated_response.body.data).toBeNull()
        expect(authenticated_response.body.errors[0].message).toBe(
            'Unauthorized.'
        )

        // Refresh the jwt with the valid refresh token. Expect to get a new, valid JWT

        const refresh_token_response = await client
            .post(`/graphql`)
            .send({
                query: gql`
                    mutation refresh_token {
                        refresh_token {
                            access_token
                            student {
                                id
                                email
                            }
                        }
                    }
                `
            })
            .set('Cookie', `___refresh__token=${refreshToken}`)

        expect(refresh_token_response.body.data.refresh_token).toEqual({
            access_token: expect.any(String),
            student: {
                id: user.id.toString(),
                email: user.email
            }
        })

        // Make a request with the refreshed jwt. Expect it to return a valid authenticated user
        const authenticated_refreshed_response = await client
            .post(`/graphql`)
            .send({
                query: gql`
                    query authenticated_student {
                        authenticated_student {
                            id
                            name
                            email
                        }
                    }
                `
            })
            .set(
                'Authorization',
                `Bearer ${refresh_token_response.body.data.refresh_token.access_token}`
            )

        expect(
            authenticated_refreshed_response.body.data.authenticated_student
        ).toEqual({
            name: null,
            id: user.id.toString(),
            email: user.email
        })
    }, jwtExpiresIn * 1000)

    setTimeout(async () => {
        // After the refresh token has expired, make a call to confirm it can no longer return fresh and new jwts

        const invalid_refresh_token_response = await client
            .post(`/graphql`)
            .send({
                query: gql`
                    mutation refresh_token {
                        refresh_token {
                            access_token
                            student {
                                id
                                email
                            }
                        }
                    }
                `
            })
            .set('Cookie', `___refresh__token=${refreshToken}`)

        expect(invalid_refresh_token_response.body.errors[0].message).toBe(
            'Invalid refresh token.'
        )

        done()
    }, refreshTokenExpiresIn * 1000)

    const authenticated_response = await client
        .post(`/graphql`)
        .send({
            query: gql`
                query authenticated_student {
                    authenticated_student {
                        id
                        name
                        email
                    }
                }
            `
        })
        .set('Authorization', `Bearer ${accessToken}`)

    const refresh_token_has_no_access_response = await client
        .post(`/graphql`)
        .send({
            query: gql`
                query authenticated_student {
                    authenticated_student {
                        id
                        name
                        email
                    }
                }
            `
        })
        .set('Authorization', `Bearer ${refreshToken}`)

    expect(refresh_token_has_no_access_response.body.data).toBeNull()
    expect(refresh_token_has_no_access_response.body.errors[0].message).toBe(
        'Unauthorized.'
    )

    expect(authenticated_response.body.data.authenticated_student).toEqual({
        name: null,
        id: user.id.toString(),
        email: user.email
    })

    // @ts-ignore
}, 10000)
