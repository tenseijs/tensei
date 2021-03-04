import { text, resource, textarea, belongsTo } from '@tensei/common'

export default resource('Comment')
    .fields([
        text('Title')
            .rules('required')
            .searchable()
            .sanitize('slug'),
        textarea('Body').rules('required'),
        text('Title Hidden From Insert And Fetch API')
            .hideOnInsertApi()
            .hideOnFetchApi(),
        text('Title Hidden From Update And Fetch API')
            .hideOnUpdateApi()
            .hideOnFetchApi(),
        belongsTo('Post')
    ])
    .showOnInsertSubscription()
