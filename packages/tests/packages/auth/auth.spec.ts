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
            .setup(({ role }) => {
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
    } = await setup(
        [
            auth()
                .user('Customer')
                .verifyEmails()
                .plugin(),
            graphql().plugin(),
            setupFakeMailer(mailerMock)
        ],
        false
    )

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
                    token
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
    expect(response.body.data.register_customer.token).toBeDefined()

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
            `Bearer ${response.body.data.register_customer.token}`
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
                    token
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
        token: expect.any(String),
        student: {
            id: user.id.toString(),
            email: user.email
        }
    })
})
