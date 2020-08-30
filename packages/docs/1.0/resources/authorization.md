# Authorization

[[toc]]

When Nova is accessed only by you or your development team, you may not need additional authorization before Nova handles incoming requests. However, if you provide access to Nova to your clients or large team of developers, you may wish to authorize certain requests. For example, perhaps only administrators may delete records. Thankfully, Nova takes a simple approach to authorization that leverages many of the Laravel features you are already familiar with.

## Policies

To limit which users may view, create, update, or delete resources, Nova leverages Laravel's [authorization policies](https://laravel.com/docs/authorization#creating-policies). Policies are simple PHP classes that organize authorization logic for a particular model or resource. For example, if your application is a blog, you may have a `Post` model and a corresponding `PostPolicy` within your application.

When manipulating a resource within Nova, Nova will automatically attempt to find a corresponding policy for the model. Typically, these policies will be registered in your application's `AuthServiceProvider`. If Nova detects a policy has been registered for the model, it will automatically check that policy's relevant authorization methods before performing their respective actions, such as:

- `viewAny`
- `view`
- `create`
- `update`
- `delete`
- `restore`
- `forceDelete`

No additional configuration is required! So, for example, to determine which users are allowed to update a `Post` model, you simply need to define an `update` method on the model's corresponding policy class:

```php
<?php

namespace App\Policies;

use App\User;
use App\Post;
use Illuminate\Auth\Access\HandlesAuthorization;

class PostPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can update the post.
     *
     * @param  \App\User  $user
     * @param  \App\Post  $post
     * @return mixed
     */
    public function update(User $user, Post $post)
    {
        return $user->type == 'editor';
    }
}
```

:::warning Undefined Policy Methods

If a policy exists but is missing a method for a particular action, the user will not be allowed to perform that action. So, if you have defined a policy, don't forget to define all of its relevant authorization methods.
:::

### Hiding Entire Resources

If you would like to hide an entire Nova resource from a subset of your dashboard's users, you may define a `viewAny` method on the model's policy class. If no `viewAny` method is defined for a given policy, Nova will assume that the user can view the resource:

```php
<?php

namespace App\Policies;

use App\User;
use App\Post;
use Illuminate\Auth\Access\HandlesAuthorization;

class PostPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any posts.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function viewAny(User $user)
    {
        return in_array('view-posts', $user->permissions);
    }
}
```

### Relationships

We have already learned how to authorize the typical view, create, update, and delete actions, but what about relationship interactions? For example, if you are building a podcasting application, perhaps you would like to specify that only certain Nova users may add comments to podcasts. Again, Nova makes this simple by leveraging Laravel's policies.

When working with relationships, Nova uses a simple policy method naming convention. To illustrate this convention, lets assume your application has `Podcast` resources and `Comment` resources. If you would like to authorize which users can add comments to a podcast, you should define an `addComment` method on your podcast model's policy class:

```php
<?php

namespace App\Policies;

use App\User;
use App\Podcast;
use Illuminate\Auth\Access\HandlesAuthorization;

class PodcastPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can add a comment to the podcast.
     *
     * @param  \App\User  $user
     * @param  \App\Podcast  $podcast
     * @return mixed
     */
    public function addComment(User $user, Podcast $podcast)
    {
        return true;
    }
}
```

As you can see, Nova uses a simple `add{Model}` policy method naming convention for authorizing relationship actions.

#### Authorizing Attaching / Detaching

For many-to-many relationships, Nova uses a similar naming convention. However, instead of `add{Model}`, you should use an `attach{Model}` / `detach{Model}` naming convention. For example, imagine a `Podcast` model has a many-to-many relationship with the `Tag` model. If you would like to authorize which users can attach "tags" to a podcast, you may add an `attachTag` method to your podcast policy. In addition, you will likely want to define the inverse `attachPodcast` on the tag policy:

```php
<?php

namespace App\Policies;

use App\Tag;
use App\User;
use App\Podcast;
use Illuminate\Auth\Access\HandlesAuthorization;

class PodcastPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can attach a tag to a podcast.
     *
     * @param  \App\User  $user
     * @param  \App\Podcast  $podcast
     * @param  \App\Tag  $tag
     * @return mixed
     */
    public function attachTag(User $user, Podcast $podcast, Tag $tag)
    {
        return true;
    }

    /**
     * Determine whether the user can detach a tag from a podcast.
     *
     * @param  \App\User  $user
     * @param  \App\Podcast  $podcast
     * @param  \App\Tag  $tag
     * @return mixed
     */
    public function detachTag(User $user, Podcast $podcast, Tag $tag)
    {
        return true;
    }
}
```

In the previous examples, we are determining if a user is authorized to attach one model to another. If certain types of users are **never** allowed to attach a given type of model, you may define a `attachAny{Model}` method on your policy class. This will prevent the "Attach" button from displaying in the Nova UI entirely:

```php
<?php

namespace App\Policies;

use App\User;
use App\Podcast;
use Illuminate\Auth\Access\HandlesAuthorization;

class PodcastPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can attach any tags to the podcast.
     *
     * @param  \App\User  $user
     * @param  \App\Podcast  $podcast
     * @return mixed
     */
    public function attachAnyTag(User $user, Podcast $podcast)
    {
        return false;
    }
}
```

:::warning Many To Many Authorization

When working with many-to-many relationships, make sure you define the proper authorization policy methods on each of the involved resource's policy classes.
:::

### Disabling Authorization

If one of your Nova resources' models has a corresponding policy, but you want to disable Nova authorization for that resource, you may override the `authorizable` method on the Nova resource:

```php
/**
 * Determine if the given resource is authorizable.
 *
 * @return bool
 */
public static function authorizable()
{
    return false;
}
```

## Fields

Sometimes you may want to hide certain fields from a group of users. You may easily accomplish this by chaining the `canSee` method onto your field definition. The `canSee` method accepts a Closure which should return `true` or `false`. The Closure will receive the incoming HTTP request:

```php
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Text;

/**
 * Get the fields displayed by the resource.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return array
 */
public function fields(Request $request)
{
    return [
        ID::make()->sortable(),

        Text::make('Name')
                ->sortable()
                ->canSee(function ($request) {
                    return $request->user()->can('viewProfile', $this);
                }),
    ];
}
```

In the example above, we are using Laravel's `Authorizable` trait's `can` method on our `User` model to determine if the authorized user is authorized for the `viewProfile` action. However, since proxying to authorization policy methods is a common use-case for `canSee`, you may use the `canSeeWhen` method to achieve the same behavior. The `canSeeWhen` method has the same method signature as the `Illuminate\Foundation\Auth\Access\Authorizable` trait's `can` method:

```php
Text::make('Name')
        ->sortable()
        ->canSeeWhen('viewProfile', $this),
```

:::tip Authorization & The "Can" Method

To learn more about Laravel's authorization helpers and the `can` method, check out the full Laravel [authorization documentation](https://laravel.com/docs/authorization#via-the-user-model).
:::

## Index Filtering

You may notice that returning `false` from a policy's `view` method does not stop a given resource from appearing in the resource index. To filter models from the resource index query, you may override the `indexQuery` method on your resource. This method is already stubbed in your `App\Nova\Resource` base class, you may simply copy and paste it into a specific resource and then modify the query:

```php
/**
 * Build an "index" query for the given resource.
 *
 * @param  \Laravel\Nova\Http\Requests\NovaRequest  $request
 * @param  \Illuminate\Database\Eloquent\Builder  $query
 * @return \Illuminate\Database\Eloquent\Builder
 */
public static function indexQuery(NovaRequest $request, $query)
{
    return $query->where('user_id', $request->user()->id);
}
```

## Relatable Filtering

If you would like to filter the queries that are used to populate relationship model selection menus, you may override the `relatableQuery` method on your resource.

For example, if your application has a `Comment` resource that belongs to a `Podcast` resource, Nova will allow you to select the parent `Podcast` when creating a `Comment`. To limit the podcasts that are available in that selection menu, you should override the `relatableQuery` method on your `Podcast` resource:

```php
/**
 * Build a "relatable" query for the given resource.
 *
 * This query determines which instances of the model may be attached to other resources.
 *
 * @param  \Laravel\Nova\Http\Requests\NovaRequest  $request
 * @param  \Illuminate\Database\Eloquent\Builder  $query
 * @return \Illuminate\Database\Eloquent\Builder
 */
public static function relatableQuery(NovaRequest $request, $query)
{
    return $query->where('user_id', $request->user()->id);
}
```

## Scout Filtering

If your application is leveraging the power of Laravel Scout for [search](./../search/scout-integration.md), you may also customize the `Laravel\Scout\Builder` query instance before it is sent to your search provider. To accomplish this, override the `scoutQuery` method on your resource:

```php
/**
 * Build a Scout search query for the given resource.
 *
 * @param  \Laravel\Nova\Http\Requests\NovaRequest  $request
 * @param  \Laravel\Scout\Builder  $query
 * @return \Laravel\Scout\Builder
 */
public static function scoutQuery(NovaRequest $request, $query)
{
    return $query->where('user_id', $request->user()->id);
}
```
