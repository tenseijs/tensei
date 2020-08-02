const {
    Resource,
    ID,
    Text,
    DateField,
    DateTime,
    BigInteger,
    Integer,
    Textarea,
    BelongsTo,
    Select,
    HasMany
} = require('@flamingo/core')

class Post extends Resource {
    messages() {
        return {
            'title.required': 'The title field is required.',
            'publishedAt.required': 'The published at field is required.',
        }
    }

    perPageOptions() {
        return [20, 50, 100]
    }

    fields() {
        return [
            ID.make(), // TODO: Make this hidden from the user. until we're ready to support custom primary keys, this would not be shown to the user.
            DateTime.make('Scheduled for').defaultToNow().notNullable(),
            BigInteger.make('Views')
                .searchable()
                .notNullable(),
            Integer.make('Av. CPV').notNullable(),
            Text.make('Title')
                .sortable()
                .searchable()
                .rules('required', 'string', 'min:36', 'max:200'),
            Text.make('Description'),
            Textarea.make('Content'),
            DateField.make('Published at')
                .firstDayOfWeek(4)
                .rules('required', 'date'),
            BelongsTo.make('User').notNullable(),
            Select.make('Category').options([{
                label: 'Javascript',
                value: 'javascript'
            }, {
                label: 'Angular',
                value: 'angular'
            }, {
                label: 'Mysql',
                value: 'mysql'
            }, {
                label: 'Postgresql',
                value: 'pg'
            }]).notNullable(),
            HasMany.make('Comment')
            // HasOne.make('Billing Address')
            //     .fields([
            //         Text.make('Country')
            //             .rules('required', 'string', 'min:6', 'max:20')
            //             .default('United States'),
            //         Text.make('State').rules('required').default('California'),
            //         Text.make('City')
            //             .rules('required')
            //             .default('San Francisco'),
            //         NumberField.make('Postal Code')
            //             .rules('required', 'number')
            //             .default(94105),
            //     ])
            //     .rules('object', 'required')
            //     .description(
            //         'Define the billing address for this post. All payment receipts copies will be sent here.'
            //     ),
            // HasManyEmbedded.make('Tags').fields([
            //     Text.make('Name').rules('required', 'max:6'),
            //     Text.make('Slug').rules('required', 'max:12'),
            // ]),
        ]
    }
}

module.exports = Post
