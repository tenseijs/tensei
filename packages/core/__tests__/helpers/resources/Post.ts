import {
    dateTime,
    integer,
    text,
    date,
    action,
    select,
    resource,
    textarea,
    belongsTo,
    belongsToMany
} from '@tensei/common'

export default resource('Post')
    .displayInNavigation()
    .actions([
        action('Publish on')
            .positive()
            .handle(async ({ notification }) => {
                return notification({
                    message: 'All articles have been published.',
                    variant: 'positive',
                    position: 'top'
                })
            })
            .fields([
                dateTime('Publish date', 'published_at').rules('required'),
                textarea('Reason for publishing', 'reason')
                    .default('A short description of why you published.')
                    .rules('required', 'max:50'),
                textarea('Post content', 'content').rules('required', 'min:12')
            ])
            .showOnTableRow(),
        action('Archive')
            .handle(async ({ html }) => {
                return html(
                    `
                    <div className='w-full bg-gray-100'>
                        <p>SOME EXAMPLE HTML TO BE SET ON THE DOM</p>
                    </div>
                `,
                    201
                )
            })
            .hideFromIndex()
            .confirmButtonText('Archive posts'),
        action('Fix SEO').handle(({ push }) =>
            push('/resources/posts/12', 202)
        ),
        action('Check status').handle(({ errors }) =>
            errors(
                [
                    {
                        message: 'Custom validation message',
                        field: 'custom-field-name'
                    }
                ],
                422
            )
        )
    ])
    .fields([
        text('Title')
            .sortable()
            .searchable()
            .unique()
            .rules('required', 'max:24'),
        text('Description').rules('required'),
        textarea('Content')
            .rules('required', 'max:2000', 'min:12')
            .hideFromIndex(),
        integer('Av. CPC')
            .rules('required')
            .hideFromDetail(),
        select('Category')
            .options([
                {
                    label: 'Javascript',
                    value: 'javascript'
                },
                {
                    label: 'Angular',
                    value: 'angular'
                },
                {
                    label: 'Mysql',
                    value: 'mysql'
                },
                {
                    label: 'Postgresql',
                    value: 'pg'
                }
            ])
            .rules('required')
            .searchable(),
        belongsTo('User')
            .searchable()
            .rules('required'),
        date('Published At')
            .notNullable()
            .firstDayOfWeek(4)
            .rules('required', 'date')
            .format('do MMM yyyy, hh:mm a'),
        dateTime('Scheduled For')
            .rules('required', 'date')
            .format('do MMM yyyy, hh:mm a'),
        belongsToMany('Tag')
    ])
    .perPageOptions([25, 50, 100])
    .displayField('title')
