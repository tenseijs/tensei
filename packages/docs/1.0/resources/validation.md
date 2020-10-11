# Validation

[[toc]]

When creating resources, it is very important to validate any data passed to your database. Tensei uses [indicative](https://indicative.adonisjs.com) for fast data validation. There's a large range of validation rules you can attach to fields, and you also have the ability to add custom validation rules.

### Attaching Rules

When defining a field on a resource, you may use the `rules` method to attach [validation rules](https://indicative.adonisjs.com/validations/master) to the field:

```js
const { text } = require('@tensei/core')

text('Name')
    .searchable()
    .rules('required', 'max:255', 'min:20')
```

All of the rules attached to a field using the `.rules()` method would be run when creating and updating the resource to which this field is attached.

### Creation Rules

If you would like to define rules that only apply when a resource is being created, you may use the `creationRules` method:

```js
text('Email')
    .searchable()
    .creationRules('required', 'email')
```

### Update Rules

Likewise, if you would like to define rules that only apply when a resource is being updated, you may use the `updateRules` method. 

```js
text('Email')
    .searchable()
    .updateRules('email')
```

### Custom validation messages

The default validation messages from the indicative library may not meet the needs of your project. To define custom validation rules, you may use the `.validationMessages()` method on the resource:

```js
const { text, resource } = require('@tensei/core')

resource('Customer')
    .fields([
        text('Email')
            .rules('required', 'email', 'max:255')
    ])
    .validationMessages({
        'email.required': 'The email is required when adding a customer.'
    })
```

### Custom validation rules

To add custom validation rules, you can create a new plugin. Plugins receive indicative as an argument, and you can extend it with new rules. Here's an example that validates the slug of an article must be in param case:

```js
const { tensei, plugin, resource, text, number } = require('@tensei/core')

tensei()
    .resources([
        resource('Post')
        .fields([
            text('Title'),
            text('Slug')
                .rules('required', 'slug'),
            number('Views')
        ])
    ])
    .plugins([
        plugin('Custom Slug Validation')
            .beforeDatabaseSetup(({ indicative }) => {
                indicative.validator.extend('slug', {
                    async: false,
                    validate(data, field, args, config) {
                        return data.original[field].match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
                    }
                })
            })
    ])
```

This custom validator can now be used on any fields in the application. 
