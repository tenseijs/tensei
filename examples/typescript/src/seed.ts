import Faker from 'faker'
import { paramCase } from 'change-case'

export function product() {
  return {
    name: Faker.lorem.sentence(),
    description: Faker.lorem.paragraph(),
    slug: paramCase(Faker.lorem.sentence()),
    price: Faker.finance.amount()
  }
}

export function category() {
  return {
    name: Faker.lorem.sentence(),
    description: Faker.lorem.paragraph(),
    slug: paramCase(Faker.lorem.sentence())
  }
}

export function collection() {
  return {
    name: Faker.lorem.sentence(),
    description: Faker.lorem.paragraph(),
    slug: paramCase(Faker.lorem.sentence())
  }
}

export function review() {
  return {
    headline: Faker.lorem.sentence(),
    name: Faker.name.findName(),
    email: Faker.internet.exampleEmail(),
    content: Faker.lorem.paragraph(),
    rating: Faker.random.number(5),
    approved: Faker.random.boolean()
  }
}

export function order() {
  return {
    total: Faker.random.number(5000),
    stripeCheckoutId: Faker.random.uuid()
  }
}

export function adminUser() {
  return {
    firstName: Faker.name.firstName(),
    lastName: Faker.name.lastName(),
    email: Faker.internet.exampleEmail(),
    password: 'password',
    active: true
  }
}

export function customer() {
  return {
    email: Faker.internet.exampleEmail(),
    password: Faker.internet.password()
  }
}

export function generate(fn: () => any, length = 20) {
  return Array.from({ length }, () => fn())
}

export async function seed(db: any) {
  if (!process.env.TENSEI_SEED) {
    return
  }

  const adminUsers = generate(adminUser).map(u => db.adminUsers().create(u))
  const customers = generate(customer).map((c: any) => db.customers().create(c))
  const orders = generate(order)
    .map((o: any) => db.orders().create(o))
    .map((o: any) => {
      o.customer = customers[Math.floor(Math.random() * customers.length)]

      return o
    })

  const categories = generate(category).map((c: any) =>
    db.categories().create(c)
  )

  const products = generate(product)
    .map((p: any) => db.products().create(p))
    .map((p: any) => {
      p.categories = categories

      return p
    })

  orders.forEach((order: any) => {
    order.products = products

    return order
  })

  await Promise.all([
    db.orders().persistAndFlush(orders),
    db.products().persistAndFlush(products),
    db.adminUsers().persistAndFlush(adminUsers)
  ])
}
