# Scout Integration

[[toc]]

By default, Nova searches your resources using the resource's database columns.
 However, this can become inefficient and lacks support for robust fuzzy matching capabilities provided by "real" search engines.

For this reason, Nova integrates seamlessly with [Laravel Scout](https://laravel.com/docs/scout). When the `Laravel\Scout\Searchable` trait is attached to a model associated with a Nova resource, Nova will automatically begin using Scout when performing searches against that resource. There is no other configuration required.

### Customizing Scout Searches

If you would like to call methods on the `Laravel\Scout\Builder` instance before it executes your search query against your search provider, you may override the `scoutQuery` method on your resource:

```php
use Laravel\Nova\Http\Requests\NovaRequest;

/**
 * Build a Scout search query for the given resource.
 *
 * @param  \Laravel\Nova\Http\Requests\NovaRequest  $request
 * @param  \Laravel\Scout\Builder  $query
 * @return \Laravel\Scout\Builder
 */
public static function scoutQuery(NovaRequest $request, $query)
{
    return $query;
}
```
