const {
    dateTime,
    integer,
    text,
    date,
    belongsTo,
    select,
    resource,
} = require('@flamingo/core')
const { trix } = require('@flamingo/trix')

module.exports = resource('Post')
    .displayInNavigation()
    .fields([
        text('Title')
            .sortable()
            .searchable().unique().rules('required', 'max:24'),
        text('Description').rules('required'),
        trix('Content').rules('required', 'max:2000', 'min:12').hideFromIndex(),
        integer('Av. CPC').rules('required').hideFromDetail(),
        select('Category').options([
            {
                label: 'Javascript',
                value: 'javascript',
            },
            {
                label: 'Angular',
                value: 'angular',
            },
            {
                label: 'Mysql',
                value: 'mysql',
            },
            {
                label: 'Postgresql',
                value: 'pg',
            },
        ]).rules('required').searchable(),
        belongsTo('User').searchable().rules('required'),
        date('Published At').notNullable().firstDayOfWeek(4).rules('required', 'date').format('do MMM yyyy, hh:mm a'),
        dateTime('Scheduled For').rules('required', 'date'),
    ])
    .perPageOptions([25, 50, 100])
    .displayField('title')
