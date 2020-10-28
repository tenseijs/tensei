# Authorization

[[toc]]

Actions performed, or data viewed on the dashboard is controlled by a roles and permissions system. Administrators must be authorized to view, update, delete, or create resources. You can add custom permissions and custom roles to fully control who has access to what sort of data and operations.

## Dashboard authorization

Authorization on the dashboard is managed using roles and permissions. By default, the `Super Admin` role has **all** permissions and can perform all actions. The first administrator registered on the dashboard would have this role. For each resource in the application, the following permissions are automatically generated:

- `create:{resource-slug}`
- `fetch:{resource-slug}`
- `show:{resource-slug}`
- `update:{resource-slug}`
- `delete:{resource-slug}`
- `run:{resource-slug}:{action-slug}`

For a more concrete example, consider the following application setup:

```javascript
const { tensei, resource, text, textarea, number, action, hasMany } = require('@tensei/core')

tensei()
    .resources([
        resource('Restaurant')
            .fields([
                text('Name'),
                number('Base Price'),
                textarea('Description'),
            ])
            .actions([
                action('Archive Restaurant')
                    .handle(async ({ request }) => {})
                    .hideOnIndex()
            ]),
        resource('Category')
            .fields([
                text('Title'),
                hasMany('Restaurant')
            ])
    ])
```

In the above example application, we have two resources `Restaurant` and `Category`. The `Restaurant` resource has an action `Archive Restaurant`. For these resources, the following permissions would be automatically generated:

- `create:restaurant`
- `fetch:restaurant`
- `show:restaurant`
- `update:restaurant`
- `delete:restaurant`
- `run:restaurant:archive-restaurant`
- `create:category`
- `fetch:category`
- `show:category`
- `update:category`
- `delete:category`

The `Create restaurant` button would only be visible on the dashboard if the logged in administrator user has the `create:restaurant` permission. Also, the `Archive restaurant` action would only be visible if the logged in administrator has the `run:restaurant:archive-restaurant` permisssion.

On the dashboard, you can create additional roles, assign different permissions to this role, and in turn assign this role to administrator users.

::: warning Something to keep in mind
The roles and permissions system of the dashboard is completely separate from that offered by the [auth plugin package](../plugins/auth.md). The auth plugin would be used to authorize permissions of your customer facing application.
:::

### Custom resource permissions

If you want to add customer permissions to a resource other than the default, you can use the `permissions` method on a resource:

```js
resource('Restaurant')
    .permissions(['close:restaurant:portal'])
```

These permissions would be saved to the database on startup. You can then attach these permissions to a role from the dashboard, and all dashboard users with this role would have that permission.

### Custom dashboard authorization checks

By default, before creating a resource, the dashboard backend checks if the logged in user has the `create:{resource-slug}` permission. If you want to perform an additional check before executing dashboard actions, you can use one of the following methods:

- `canShowOnDashboard(() => true/false)`
- `canFetchOnDashboard() => true/false)`
- `canCreateOnDashboard(() => true/false)`
- `canUpdateOnDashboard(() => true/false)`
- `canDeleteOnDashboard(() => true/false)`
- `canRunActionOnDashboard(() => true/false)`

```js
resource('Restaurant')
    .canUpdateOnDashboard(async (request, restaurants) => {
        return restaurants.map(
            restaurant => restaurant.user_id === request.user.id
        ).length > 0
    })
```

:::tip Multiple authorization checks
You can add multiple authorization checks to a resource by calling the authorization method multiple times. For example, calling `canUpdateOnDashboard` multiple times would check all the callbacks you pass to it.
:::
