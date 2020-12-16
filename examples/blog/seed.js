const Bcrypt = require('bcryptjs')
const { build, fake, sequence } = require('@jackfranklin/test-data-bot')

const userBuilder = build('User', {
    fields: {
        full_name: fake((f) => f.name.findName()),
        email: fake((f) => f.internet.exampleEmail()),
        password: Bcrypt.hashSync('password'),
        // created_at: fake((f) => f.date.recent(f.random.number())),
    },
})

const administratorBuilder = build('User', {
    fields: {
        name: fake((f) => f.name.findName()),
        email: fake((f) => f.random.number() + '_' + f.internet.exampleEmail()),
        password: Bcrypt.hashSync('password'),
        // created_at: fake((f) => f.date.recent(f.random.number())),
    },
})

const postBuilder = build('Post', {
    fields: {
        user_id: sequence(),
        title: fake((f) => f.lorem.sentence()),
        approved: fake((f) => f.random.boolean()),
        description: fake((f) => f.lorem.sentence()),
        content: fake((f) => f.lorem.sentence(10)),
        av_cpc: fake((f) => f.random.number()),
        category: fake((f) =>
            f.random.arrayElement(['angular', 'javascript', 'mysql', 'pg'])
        ),
        slug: fake((f) => `${f.lorem.slug()}-${Date.now()}`),
        published_at: fake((f) => f.date.past()),
        scheduled_for: fake((f) => f.date.future()),
        // created_at: fake((f) => f.date.recent(f.random.number())),
    },
})

const tagsBuilder = build('Tag', {
    fields: {
        name: fake((f) => f.lorem.sentence()),
        description: fake((f) => f.lorem.sentence(10)),
        // created_at: fake((f) => f.date.recent(f.random.number())),
    },
})

const commentsBuilder = build('Comment', {
    fields: {
        title: fake((f) => f.lorem.sentence()),
        body: fake((f) => f.lorem.sentence()),
        reply: fake((f) => f.lorem.sentence()),
        // created_at: fake((f) => f.date.recent(f.random.number())),
    },
})

const postsTagsBuilder = build('PostTag', {
    fields: {
        post_id: sequence(),
        tag_id: sequence(),
        // created_at: fake((f) => f.date.recent(f.random.number())),
    },
})

const posts = Array(1000)
    .fill(undefined)
    .map(() => postBuilder())

const users = Array(10)
    .fill(undefined)
    .map(() => userBuilder())

const tags = Array(1000)
    .fill(undefined)
    .map(() => tagsBuilder())

const comments = Array(1000)
    .fill(undefined)
    .map(() => commentsBuilder())

const posts_tags = Array(1000)
    .fill(undefined)
    .map(() => postsTagsBuilder())

const administrators = Array(50)
    .fill(undefined)
    .map(() => administratorBuilder())

async function seedMongo(resources, connection) {
    await Promise.all(
        resources.map((resource) => {
            const Model = resource.Model()
            return Model.deleteMany({})
        })
    )

    await Promise.all(
        resources.map((resource) => {
            const Model = resource.Model()

            if (resource.data.name === 'Post') {
                return Model.insertMany(posts)
            }

            if (resource.data.name === 'Administrator') {
                return Model.insertMany(administrators)
            }

            if (resource.data.name === 'Tag') {
                return Model.insertMany(tags)
            }

            if (resource.data.name === 'User') {
                return Model.insertMany(users)
            }

            if (resource.data.name === 'Comment') {
                return Model.insertMany(comments)
            }

            return Promise.resolve()
        })
    )

    await connection.close()
}

require('./app')
    .start()
    .then(async (tensei) => {
        const {
            ctx: {
                orm: { em },
            },
        } = tensei

        const userObjects = users.map((user) => em.create('User', user))

        await em.persistAndFlush(userObjects)

        const savedUsers = await em.find('User')

        for (let index = 0; index < savedUsers.length; index++) {
            const user = savedUsers[index]

            const posts = Array(10)
                .fill(undefined)
                .map(() => em.create('Post', postBuilder()))
                .map((post) => {
                    post.user = user

                    return post
                })

            await em.persistAndFlush(posts)
        }

        const savedPosts = await em.find('Post')

        for (let index = 0; index < savedPosts.length; index++) {
            const post = savedPosts[index]

            const comments = Array(10)
                .fill(undefined)
                .map(() => em.create('Comment', commentsBuilder()))
                .map((comment) => {
                    comment.post = post

                    return comment
                })

            await em.persistAndFlush(comments)
        }

        const tags = Array(10)
            .fill(undefined)
            .map(() => em.create('Tag', tagsBuilder()))
            .map((tag) => {
                tag.posts = savedPosts

                return tag
            })
        await em.persistAndFlush(tags)

        await tensei.ctx.orm.close(true)
    })
