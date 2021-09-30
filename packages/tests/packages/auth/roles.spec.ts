import { auth, role, permission } from '@tensei/auth'
import { fakeUser, setup } from './setup'

const prepare = () =>
  setup([
    auth()
      .user('Customer')
      .roles([
        role('Writer')
          .description('Can write articles')
          .permissions([
            permission('Create articles'),
            permission('Read articles')
          ]),
        role('Regular User')
          .description('Can write articles')
          .permissions([
            permission('Create articles'),
            permission('Read articles'),
            permission('Vote articles')
          ]),
        role('Admin')
          .description('Can manage everything')
          .permissions([
            permission('Create articles'),
            permission('Read articles'),
            permission('Update articles'),
            permission('Delete articles')
          ])
      ])
      .plugin()
  ])

test('can get all roles and permissions of a user', async () => {
  const {
    ctx: { db }
  }: any = await prepare()

  const userDetails = fakeUser()

  let customer: any = db.customers().create({
    ...userDetails,
    roles: ['writer', 'regular-user']
  })

  await db.customers().persistAndFlush(customer)

  customer = await db.customers().findOne({
    email: userDetails.email
  })

  const allRoles = customer.getAllRoles()
  const allPermissions = customer.getAllPermissions()

  expect(allRoles.map(role => role.config.slug)).toEqual([
    'writer',
    'regular-user'
  ])

  expect(allPermissions.map(permission => permission.config.slug)).toEqual([
    'create-articles',
    'read-articles',
    'vote-articles'
  ])
})

test('can assign a role to a user', async () => {
  const {
    ctx: { db }
  }: any = await prepare()

  const userDetails = fakeUser()

  let customer: any = db.customers().create({
    ...userDetails,
    roles: ['writer']
  })

  await db.customers().persistAndFlush(customer)

  customer = await db.customers().findOne({
    email: userDetails.email
  })

  const allRolesBefore = await customer.getAllRoles()

  expect(allRolesBefore.map(role => role.config.slug)).toEqual(['writer'])

  await customer.assignRole('Regular User')

  const allRoles = await customer.getAllRoles()

  expect(allRoles.map(role => role.config.slug)).toEqual([
    'writer',
    'regular-user'
  ])
})

test('cannot assign an unknown role to a user', async () => {
  expect.assertions(2)
  const {
    ctx: { db }
  }: any = await prepare()

  const userDetails = fakeUser()

  let customer: any = db.customers().create({
    ...userDetails,
    roles: ['writer']
  })

  await db.customers().persistAndFlush(customer)

  customer = await db.customers().findOne({
    email: userDetails.email
  })

  const allRolesBefore = await customer.getAllRoles()

  try {
    await customer.assignRole('Doctor')
  } catch (error) {
    expect(error.message).toEqual(`Role Doctor does not exist.`)
  }

  const allRoles = await customer.getAllRoles()

  expect(allRoles.map(role => role.config.slug)).toEqual(
    allRolesBefore.map(role => role.config.slug)
  )
})

test('nothing happens if we assign a role the user already has', async () => {
  const {
    ctx: { db }
  }: any = await prepare()

  const userDetails = fakeUser()

  let customer: any = db.customers().create({
    ...userDetails,
    roles: ['writer']
  })

  await db.customers().persistAndFlush(customer)

  customer = await db.customers().findOne({
    email: userDetails.email
  })

  const allRolesBefore = await customer.getAllRoles()

  await customer.assignRole('Writer')

  const allRoles = await customer.getAllRoles()

  expect(allRoles.map(role => role.config.slug)).toEqual(
    allRolesBefore.map(role => role.config.slug)
  )
})

test('can remove a role from a user', async () => {
  const {
    ctx: { db }
  }: any = await prepare()

  const userDetails = fakeUser()

  let customer: any = db.customers().create({
    ...userDetails,
    roles: ['writer', 'regular-user']
  })

  await db.customers().persistAndFlush(customer)

  customer = await db.customers().findOne({
    email: userDetails.email
  })

  await customer.removeRole('regular-user')

  const allRoles = await customer.getAllRoles()

  expect(allRoles.map(role => role.config.slug)).toEqual(['writer'])
})

test('can check if user has role or permission', async () => {
  const {
    ctx: { db }
  }: any = await prepare()

  const userDetails = fakeUser()

  let customer: any = db.customers().create({
    ...userDetails,
    roles: ['writer', 'regular-user']
  })

  await db.customers().persistAndFlush(customer)

  customer = await db.customers().findOne({
    email: userDetails.email
  })

  expect(customer.hasRole('writer')).toBe(true)
  expect(customer.hasRole('regular-user')).toBe(true)
  expect(customer.hasPermission('Vote articles')).toBe(true)
})

test('can virtually get allRoles and allPermissions', async () => {
  const {
    ctx: { db }
  }: any = await prepare()

  const userDetails = fakeUser()

  let customer: any = db.customers().create({
    ...userDetails,
    roles: ['writer', 'regular-user']
  })

  await db.customers().persistAndFlush(customer)

  customer = await db.customers().findOne({
    email: userDetails.email
  })

  expect(
    customer
      .toJSON()
      .allRoles.map(role => [role.config.name, role.config.permissions.length])
  ).toEqual([
    ['Writer', 2],
    ['Regular User', 3]
  ])
})
