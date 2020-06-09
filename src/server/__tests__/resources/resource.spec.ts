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

class ShoppingCart extends Resource {}

describe('Resource class', () => {
    it('Correctly serializes the resource', () => {
        const post = new Post()

        expect(post.serialize()).toEqual({
            label: 'Posts',
            collection: 'posts',
            displayInNavigation: true,
            group: 'All',
            primaryKey: '_id',
            perPageOptions: [10, 25, 50, 100],
            name: 'Post',
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
        })
    })

    it('serialises multiple word resources correctly', () => {
        const shoppingCart = new ShoppingCart()

        expect(shoppingCart.serialize()).toEqual({
            label: 'Shopping Carts',
            collection: 'shopping-carts',
            displayInNavigation: true,
            group: 'All',
            primaryKey: '_id',
            perPageOptions: [10, 25, 50, 100],
            name: 'ShoppingCart',
        })
    })
})
