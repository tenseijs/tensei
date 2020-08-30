# CSS / JavaScript

[[toc]]

## CSS

Nova utilizes the [Tailwind.css](https://tailwindcss.com/docs/what-is-tailwind/) utility library for all styling. So, you are free to leverage all Tailwind features and classes that are needed by your custom components.

## JavaScript

When building custom Nova tools, resource tools, cards, and fields, you may use a variety of helpers that are globally available to your JavaScript components.

### Axios

The [Axios HTTP library](https://github.com/axios/axios) is globally available, allowing you to easily make requests to your custom component's Laravel controllers:

```js
axios.get('/nova-vendor/stripe-inspector/endpoint').then(response => {
    // ...
})
```

#### Nova Requests

As an alternative to using Axios directly, you may use the `Nova.request()` method. This method configures a separate instance of Axios that has pre-configured interceptors to handle and redirect on `401`, `403`, and `500` level server errors:

```js
Nova.request().get('/nova-vendor/stripe-inspector/endpoint').then(response => {
    // ...
})
```

### Event Bus

The global `Nova` JavaScript object may be used as an event bus by your custom components. The bus provides the following methods, which correspond to and have the same behavior as the event methods [provided by Vue](https://vuejs.org/v2/api/#Instance-Methods-Events):

```js
Nova.$on(event, callback)
Nova.$once(event, callback)
Nova.$off(event, callback)
Nova.$emit(event, callback)
```

### Notifications

Nova's Vue configuration automatically registers the [Vue toasted plugin](https://github.com/shakee93/vue-toasted). So, within your custom components, you may leverage the `this.$toasted` object to display simple notifications:

```js
this.$toasted.show('It worked!', { type: 'success' })
this.$toasted.show('It failed!', { type: 'error' })
```

### Global Variables

The global `Nova` JavaScript object's `config` property contains the current Nova `base` path and `userId`:

```js
const userId = Nova.config.userId;
const basePath = Nova.config.base;
```

However, you are free to add additional values to this object using the `Nova::provideToScript` method. You may call this method within a `Nova::serving` listener, which should typically be registered in the `boot` method of your application or custom component's service provider:

```php
use Laravel\Nova\Nova;
use Laravel\Nova\Events\ServingNova;

/**
 * Bootstrap any application services.
 *
 * @return void
 */
public function boot()
{
    Nova::serving(function (ServingNova $event) {
        Nova::provideToScript([
            'user' => $event->request->user()->toArray(),
        ]);
    });
}
```

Once the variable has been provided to Nova via the `provideToScript` method, you may access it on the global `Nova` JavaScript object:

```php
const name = Nova.config.user.name;
```

### Vue DevTools

By default, Nova's JavaScript is compiled for production. As such, you will not be able to access the Vue DevTools out of the box without compiling Nova's JavaScript for development. To accomplish this, you may use the following terminal commands from the root of your Nova project:

```bash
cd ./vendor/laravel/nova
mv webpack.mix.js.dist webpack.mix.js
npm install
npm run dev
rm -rf node_modules
cd -
php artisan nova:publish
```

Please note, compiling Nova's assets for production purposes is not supported.

### Other Available Libraries

In addition to Axios, the [Lodash](https://lodash.com/) and [Moment.js](https://momentjs.com/) libraries are globally available to your custom components.
