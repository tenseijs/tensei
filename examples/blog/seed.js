const faker = require('faker')

const make = (fn, n = 50) => Array.from({ length: n }, () => fn())

module.exports = async ctx => {
  const postsSeeder = () =>
    ctx.repositories.posts().create({
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph()
    })

  const tagsSeeder = () =>
    ctx.repositories.tags().create({
      name: faker.lorem.words(3)
    })

  const pegsSeeder = () =>
    ctx.repositories.pegs().create({
      name: faker.lorem.words(3)
    })

  const categoriesSeeder = () =>
    ctx.repositories.categories().create({
      name: faker.lorem.words(2),
      description: faker.lorem.paragraph()
    })

  const categories = make(categoriesSeeder, 2)

  await ctx.orm.em.persistAndFlush()

  for (let index = 0; index < categories.length; index++) {
    const category = categories[index]

    const posts = make(postsSeeder, 5)

    const pegs = make(pegsSeeder, 4)

    for (let index = 0; index < pegs.length; index++) {
      const peg = pegs[index]

      const postsForPegs = make(postsSeeder, 3)

      await ctx.orm.em.persistAndFlush(postsForPegs)

      peg['posts'] = postsForPegs
    }

    for (let index = 0; index < posts.length; index++) {
      const post = posts[index]

      const tags = make(tagsSeeder, 5)

      await ctx.orm.em.persistAndFlush(tags)

      post.tags = tags
    }

    await ctx.orm.em.persistAndFlush([...posts, ...pegs])

    category.posts = posts
    category.pegs = pegs
  }

  await ctx.orm.em.persistAndFlush(categories)
}
