export const resources = [
    {
        collection: 'posts',
        defaultPerPage: 1,
        displayInNavigation: true,
        fields: [],
        group: 'All',
        label: 'Posts',
        slug: 'posts',
        messages: {
            'title.required': 'The title field is required.',
            'publishedAt.required': 'The published at field is required.',
        },
        name: 'Post',
        param: 'posts',
        perPageOptions: (3)[(1, 3, 5)],
        primaryKey: '_id',
    },
]

export const user = {
    email: 'dodo@email.com',
    firstName: 'dozie',
    lastName: 'nwoga',
    password: '$2a$10$d.IeGxbRR4kc1ZxE7u0LSuHMrX9aMlUrbLgLoxqEcVI9I2CyntgV.',
    _id: '5f0d62b4e2fab0431e1d35cf',
}
