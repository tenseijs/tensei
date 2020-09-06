const { resource, text, plugin } = require('@tensei/common')

console.log(
    resource('Bean').fields([
        text('Seed').notNullable().showOnCreation().showOnDetail(),
    ]),
    plugin(
        'Beans'
    ).beforeCoreRoutesSetup(async ({ app, resources, pushResource }) => {})
)
