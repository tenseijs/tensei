import { text, resource, textarea, belongsTo } from '@tensei/common'

export default resource('Comment')
  .method('firstThreeCharactersOfTitle', function () {
    return this.title.slice(0, 4)
  })
  .repositoryMethod<(title: string) => Promise<void>>(
    'deleteByTitle',
    async function (title: string) {
      const comment = await this.findOne({
        title
      })

      await this.removeAndFlush(comment)

      return comment
    }
  )
  .fields([
    text('Title').rules('required').searchable().sanitize('slug'),
    textarea('Body').rules('required'),
    text('Title Hidden From Insert And Fetch API')
      .nullable()
      .hideOnInsertApi()
      .hideOnFetchApi(),
    text('Title Hidden From Update And Fetch API')
      .nullable()
      .hideOnUpdateApi()
      .hideOnFetchApi(),
    belongsTo('Post').nullable()
  ])
  .showOnInsertSubscription()
