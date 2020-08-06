const {
    dateTime,
    integer,
    text,
    textarea,
    date,
    belongsTo,
    select,
    resource,
} = require('@flamingo/core')

module.exports = resource('Post')
    .displayInNavigation()
    .fields([
        dateTime('Scheduled For'),
        integer('Av. CPC'),
        text('Title')
            .sortable()
            .searchable().unique(),
        text('Description').searchable().sortable(),
        textarea('Content'),
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
        ]),
        belongsTo('User').notNullable(),
        date('Published At').notNullable().firstDayOfWeek(4),
    ])
    .perPageOptions([25, 50, 100])
