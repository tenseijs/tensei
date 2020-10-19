# Fields

[[toc]]

A field represents a database column. In the case of NoSQL databases, this would be a collection field.

Each Tensei resource has a `fields` method. This method takes in an array of fields that define the columns on the table this resource maps to.

Fields are much more than just columns. They can represent any way of collecting data from the user. Tensei ships with a variety of fields out of the box, including fields for text inputs, booleans, dates, file uploads, Markdown, Wysiwyg editors, Rich editors and more.

## Defining Fields
To create a field, first you need to identify the type of data this field would be storing. Let's take a `Post` resource for example. A Post might have a `Title` field and a `Published` field. The title field would be a `varchar` column, and the `published` field would be a `boolean` column.

If you're using a NoSQL database, the title would be a `String` field, and  published would be a `Boolean` field.

```js
const { tensei, resource, text, boolean } = require('@tensei/core')

tensei()
    .resources([
        resource('Post')
            .fields([
                text('Title'),
                boolean('Published')
            ])
    ])
```

### Field Column Conventions

Tensei will "snake case" the name of the field to determine the underlying database column. For example, the `text('Example Title')` field would connect to the `example_title` column. However, if necessary, you may pass the column name as the second argument to the field's method:

```javascript
text('Title', 'custom_title_column')
```

## Showing / Hiding Fields

As mentioned above, the defined fields would not only be used to determine the database columns, but also the types of input components to display on the dashboard.

Often, you will only want to display a field in certain situations. For example, there is typically no need to show a `Password` field on a resource index listing. Likewise, you may wish to only display a `Created At` field on the creation / update forms. Tensei makes it a breeze to hide / show fields on certain screens.

The following methods may be used to show / hide fields based on the display context:

- `showOnIndex`
- `showOnDetail`
- `showOnCreate`
- `showOnUpdate`
- `hideOnIndex`
- `hideOnDetail`
- `hideOnCreate`
- `hideOnUpdate`
- `onlyOnForms`
- `exceptOnForms`

You may chain any of these methods onto your field's definition in order to instruct Nova where the field should be displayed:

```javascript
resource('Post')
    .fields([
        text('Title')
            .hideOnIndex()
            .hideOnUpdate()
    ])
```

The Title field would be hidden from the resource index table because we called `hideOnIndex()`, and will be hidden when updating a `Post` because we called `hideOnUpdate()`.

## Sortable Fields

When attaching a field to a resource, you may use the `sortable` method to indicate that the resource index may be sorted by the given field:

```js
resource('Post')
    .fields([
        text('Title')
            .sortable()
    ])
```

## Searchable Fields

You may use the `searchable` method to indicate that this field can be searched. When the search box on the resource index is used, only the searchable fields would be queried. All searchable fields would also be indexed in the database.

```js
resource('Post')
    .fields([
        text('Title')
            .searchable()
    ])
```

## Field Types

:::tip Relationship Fields

This portion of the documentation only discusses non-relationship fields. To learn more about relationship fields, [check out their documentation](/1.0/resources/relationships.html).
:::

Nova ships with a variety of field types. So, let's explore all of the available types and their options:

- [Avatar](#avatar-field)
- [Boolean](#boolean-field)
- [Country](#country-field)
- [Currency](#currency-field)
- [Date](#date-field)
- [DateTime](#datetime-field)
- [File](#file-field)
- [Image](#image-field)
- [Markdown](#markdown-field)
- [Number](#number-field)
- [Select](#select-field)
- [Text](#text-field)
- [Textarea](#textarea-field)

### Avatar Field

The `Avatar` field extends the [Image field](#image-field) and accepts the same options and configuration:

```js
const { resource, avatar } = require('@tensei/core')

resource('Customer')
    .fields([
        avatar('Photo Url')
    ])
```



### Boolean Field

The `Boolean` field may be used to represent a boolean / "tiny integer" column in your database. For example, assuming your database has a boolean column named `active`, you may attach a `Boolean` field to your resource like so:

```js
const { resource, boolean } = require('@tensei/core')

resource('Customer')
    .fields([
        boolean('Active')
    ])
```

A `Boolean` field would show up as a checkbox on dashboard forms.

### Country Field

The `Country` field generates a `Select` field containing a list of the world's countries. The field will store the country's two-letter code:

```js
const { resource, country } = require('@tensei/core')

resource('Customer')
    .fields([
        country('Country')
    ])
```

### Currency Field

The `Currency` field generates a `Number` field that is formatted displayed using Javascript's [Intl.NumberFormat()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat) object. You may specify the currency using the `.currency` method on the field instance, and specify the locale using the `.locale()` method. These would be directly passed to `new Intl.NumberFormat()`.

```js
const { resource, currency } = require('@tensei/core')

resource('Employee')
    .fields([
        currency('Salary')
            .currency('EUR')
            .locale('de-DE')
    ])
```

### Date Field

The `Date` field may be used to store a date value (without time).

```js
const { resource, date } = require('@tensei/core')

resource('Employee')
    .fields([
        date('Birthday')
    ])
```

#### Default date time
You can default this field to the current time using `.defaultToNow()` method. If a default value is not defined when creating a resource, this value would default to the current date.

```js
date('Birthday')
    .defaultToNow()
```

#### Date Formats

You may customize the display format of your `Date` fields using the `format` method. This format won't affect how the date is saved to the database. The format must be a format supported by [Day.js](https://day.js.org/docs/en/parse/string-format):

```js
date('Birthday')
    .format('do MMM yyyy, hh:mm a'),
```

### DateTime Field

The `DateTime` field may be used to store a date-time value. It will also show a date/time picker on dashboard forms.

```js
const { resource, dateTime } = require('@tensei/core')

resource('Employee')
    .fields([
        dateTime('Started On')
    ])
```

You may customize the display format of your `DateTime` fields using the `format` method. This format won't affect how the date is saved to the database. The format must be a format supported by [Day.js](https://day.js.org/docs/en/parse/string-format):

```js
dateTime('Birthday')
    .format('do MMM yyyy, hh:mm a'),
```

### File Field

To learn more about defining file fields and handling uploads, check out the additional [file field documentation](./file-fields.md).

```js
const { resource, file } = require('@tensei/core')

resource('Customer')
    .fields([
        file('Invoice')
    ])
```

### Image Field

The `Image` field extends the [File field](#file-field) and accepts the same options and configurations. The `Image` field, unlike the `File` field, will display a thumbnail preview of the underlying image when viewing the resource:

```js
const { resource, image } = require('@tensei/core')

resource('Customer')
    .fields([
        image('Invoice')
    ])
```

By default, the `Image` field allows the user to download the linked file. To disable this you can call the `disableDownload` method on the field instance:

```js
image('Invoice')->disableDownload()
```

:::tip File Fields

To learn more about defining file fields and handling uploads, check out the additional [file field documentation](./file-fields.md).
:::

### Number Field

The `Number` field provides an `input` control with a `type` attribute of `number`:

```js
const { resource, number } = require('@tensei/core')

resource('Book')
    .fields([
        number('Price')
    ])
```

You may use the `min`, `max`, and `step` methods to set their corresponding attributes on the generated `input` control:

```js
number('Price').min(1).max(1000).step(0.01)
```

### Select Field

The `Select` field may be used to generate a drop-down select menu. The select menu's options may be defined using the `options` method:

```js
const { select } = require('@tensei/core')

resource('Book')
    .fields([
        select('Category')
            .options([{
                label: 'Postgresql',
                value: 'pg'
            }, {
                label: 'SQL database',
                value: 'sql'
            }])
    ])
```

### Text Field

The `Text` field provides an `input` control with a `type` attribute of `text`:

```js
const { text } = require('@tensei/core')

resource('Book')
    .fields([
        text('Title')    
    ])
```

Text fields may be customized further by setting any attribute on the field. This can be done by calling the `htmlAttributes` method:

```js
text('Title')
    .htmlAttributes({
        placeholder: 'Enter your email'
    })
```

### Textarea Field

The `Textarea` field provides a `textarea` control:

```js
const { textarea } = require('@tensei/core')

resource('Book')
    .fields([
        textarea('Description')    
    ])
```

By default, Textarea fields will not display their content when viewing a resource on its detail page. It will be hidden behind a "Show Content" link, that when clicked will reveal the content. You may specify the Textarea field should always display its content by calling the `alwaysShow` method on the field itself:

```js
textarea('Description').alwaysShow()
```

You may also specify the textarea's height by calling the `rows` method on the field:

```js
textarea('Description').rows(7)
```

Textarea fields may be customized further by setting any attribute on the field. This can be done by calling the `htmlAttributes` method:

```php
textarea('Description').htmlAttributes({
    placeholder: 'Some description of this book ...'
})
```

## Customization

### Nullable Fields

By default, Tensei allows all database columns to be nullable. If you want to add a not nullable constraint on a column, use the `.notNullable()` method:

```js
text('Title').notNullable()
```

### Field Help Text

If you would like to place "help" text beneath a field, you may use the `help` method:

```js
text('Description').help('Provide a clear description of this book.')
```
