# The Basics

[[toc]]

Tensei CMS is an open-source, easy to use, developer first headless CMS for rapidly building javascript applications. It comes built in with a beautiful, highly customizable dashboard to administer your database records.

A resource in Tensei represents a data model. An example of resources you might have in a blogging application would be `Post`, `Author`, `Tag`, and `Comment`.

Tensei would automatically generate API endpoints for these resources, and also pages on the dashboard for managing these resources.

## Defining Resources

To define a resource, use the `resource` function. The first argument is the name of the resource. It returns a resource highly customisable resource instance.

```js
const { resource } = require('@tensei/core')

resource('Post')
```

This resource called `Post` would connect to a database table called `posts`, which matches the plural, lowercase of the resource name. 

## Registering Resources

The `resources` method on the Tensei instance can be used to register all resources of the application. It takes in an array resource instances.

```js
const { tensei, resource } = require('@tensei/core')

tensei()
    .resources([
        resource('Tag'),
        resource('Post'),
        resource('Author'),
        resource('Comment'),
    ])
```

## Grouping Resources

If you would like to separate resources into different sidebar groups on the dashboard, you may call the `group` method on the resource instance.

```js
const { tensei, resource } = require('@tensei/core')

tensei()
    .resources([
        resource('Post').group('Blog & Writing'),
        resource('Author').group('Blog & Writing'),
    ])
```

Now the `Post` and `Author` resources would be in the same group. This is a great way to separate concerns on your dashboard.

## Pagination
