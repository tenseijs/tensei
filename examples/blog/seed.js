const Bcrypt = require('bcryptjs')
const { build, fake, sequence } = require('@jackfranklin/test-data-bot')

const userBuilder = build('User', {
    fields: {
        full_name: fake((f) => f.name.findName()),
        email: fake((f) => f.internet.exampleEmail()),
        password: Bcrypt.hashSync('password'),
    },
})

const administratorBuilder = build('User', {
    fields: {
        name: fake((f) => f.name.findName()),
        email: fake((f) => f.internet.exampleEmail()),
        password: Bcrypt.hashSync('password'),
    },
})

const postBuilder = build('Post', {
    fields: {
        user_id: sequence(),
        title: fake((f) => f.lorem.sentence()),
        description: fake((f) => f.lorem.sentence()),
        content: fake((f) => f.lorem.sentence(10)),
        av_cpc: fake((f) => f.random.number()),
        category: fake((f) =>
            f.random.arrayElement(['angular', 'javascript', 'mysql', 'pg'])
        ),
        published_at: fake((f) => f.date.past()),
        scheduled_for: fake((f) => f.date.future()),
    },
})

const tagsBuilder = build('Tag', {
    fields: {
        name: fake((f) => f.lorem.sentence()),
        description: fake((f) => f.lorem.sentence(10)),
    },
})

const commentsBuilder = build('Comment', {
    fields: {
        post_id: sequence(),
        title: fake((f) => f.lorem.sentence()),
        body: fake((f) => f.lorem.paragraph(2)),
    },
})

const postsTagsBuilder = build('PostTag', {
    fields: {
        post_id: sequence(),
        tag_id: sequence(),
    },
})

require('./flamingo')
    .register()
    .then(async ({ databaseClient: knex }) => {
        await Promise.all([
            knex('posts').truncate(),
            knex('users').truncate(),
            knex('tags').truncate(),
            knex('comments').truncate(),
            knex('administrators').truncate(),
        ])

        const posts = Array(500)
            .fill(undefined)
            .map(() => postBuilder())
        const users = Array(500)
            .fill(undefined)
            .map(() => userBuilder())
        const tags = Array(500)
            .fill(undefined)
            .map(() => tagsBuilder())
        const comments = Array(500)
            .fill(undefined)
            .map(() => commentsBuilder())
        const posts_tags = Array(500)
            .fill(undefined)
            .map(() => postsTagsBuilder())
        const administrators = Array(50)
            .fill(undefined)
            .map(() => administratorBuilder())

        await Promise.all([
            knex('posts').insert(posts),
            knex('users').insert(users),
            knex('tags').insert(tags),
            knex('comments').insert(comments),
            knex('administrators').insert(administrators),
            knex('posts_tags').insert(posts_tags),
        ])

        await knex.destroy()
    })
