import { setup, fakeComment } from './setup'

test('can register custom model methods on resource instances', async () => {
  const { ctx } = await setup()

  const commentStub = fakeComment()

  const db = ctx.db as any

  await db.comments.persistAndFlush(db.comments.create(commentStub))

  const comment = await db.comments.findOne({
    title: commentStub.title
  })

  expect(comment.firstThreeCharactersOfTitle()).toBe(
    commentStub.title.slice(0, 4)
  )
})

test('can register custom repository methods on resource instances', async () => {
  const { ctx } = await setup()

  const commentStub = fakeComment()

  const db = ctx.db as any

  await db.comments.persistAndFlush(db.comments.create(commentStub))

  const deletedComment = await db.comments.deleteByTitle(commentStub.title)

  expect(deletedComment.body).toBe(commentStub.body)

  expect(
    await db.comments.findOne({
      title: commentStub.title
    })
  ).toBeNull()
})
