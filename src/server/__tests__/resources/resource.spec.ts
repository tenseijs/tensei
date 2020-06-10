import ID from '../../fields/ID'
import Text from '../../fields/Text'
import Resource from '../../resources/Resource'

class Post extends Resource {}

class User extends Resource {
    displayInNavigation() {
        return false
    }

    group() {
        return 'Finance'
    }

    label() {
        return 'Department leads'
    }

    primaryKey() {
        return 'id'
    }

    public perPageOptions() {
        return [100, 250, 500]
    }
}

class PostAuthorLabel extends Resource {}

class ShoppingCart extends Resource {
    public fields() {
        return [
            ID.make().asObjectId(),
            Text.make('Name', 'first_name')
                .sortable()
                .prefix('ox')
                .suffix('ox')
                .default('beans')
                .htmlAttributes({
                    required: true,
                    email: true,
                    title: 'User first name'
                })
                .hideFromIndex()
                .hideWhenUpdating()
        ]
    }
}

describe('Resource class', () => {
    it('Correctly serializes the resource', () => {
        const post = new Post()

        expect(post.serialize()).toEqual({
            label: 'Posts',
            collection: 'posts',
            displayInNavigation: true,
            group: 'All',
            primaryKey: '_id',
            param: 'posts',
            perPageOptions: [10, 25, 50, 100],
            name: 'Post',
            fields: []
        })
    })

    it('Correctly serializes the resource when properties are updated', () => {
        const user = new User()

        expect(user.serialize()).toEqual({
            label: 'Department leads',
            collection: 'users',
            displayInNavigation: false,
            group: 'Finance',
            primaryKey: 'id',
            perPageOptions: [100, 250, 500],
            name: 'User',
            param: 'users',
            fields: []
        })
    })

    it('serialises multiple word resources correctly', () => {
        const postAuthorLabel = new PostAuthorLabel()

        expect(postAuthorLabel.serialize()).toEqual({
            label: 'Post Author Labels',
            collection: 'post-author-labels',
            displayInNavigation: true,
            group: 'All',
            primaryKey: '_id',
            param: 'post-author-labels',
            perPageOptions: [10, 25, 50, 100],
            name: 'PostAuthorLabel',
            fields: []
        })

        expect(postAuthorLabel.serialize()).toMatchSnapshot()
    })

    it('correctly serializes all fields passed to resource', () => {
        const shoppingCart = new ShoppingCart()

        expect(shoppingCart.serialize()).toEqual({
            label: 'Shopping Carts',
            collection: 'shopping-carts',
            displayInNavigation: true,
            group: 'All',
            primaryKey: '_id',
            param: 'shopping-carts',
            perPageOptions: [10, 25, 50, 100],
            name: 'ShoppingCart',
            fields: [{
                attributes: {},
                component: 'id-field',
                databaseField: '_id',
                defaultValue: '',
                name: 'ID',
                showOnCreation: false,
                showOnDetail: true,
                showOnIndex: true,
                showOnUpdate: false,
                type: 'IDField',
                isSortable: false,
                asObjectId: true,
                asString: false
            }, {
                attributes: {
                    required: true,
                    email: true,
                    title: 'User first name'
                },
                component: 'text-field',
                databaseField: 'first_name',
                defaultValue: 'beans',
                name: 'Name',
                prefix: 'ox',
                showOnCreation: true,
                showOnDetail: true,
                showOnIndex: false,
                showOnUpdate: false,
                suffix: 'ox',
                type: 'TextField',
                isSortable: true
            }]
        })

        expect(shoppingCart.serialize()).toMatchSnapshot()
    })
})
