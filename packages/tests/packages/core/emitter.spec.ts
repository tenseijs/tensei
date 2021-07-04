import { tensei, event, resource } from '@tensei/core'

const setup = () =>
  tensei()
    .resources([resource('Product')])
    .db({
      dbName: 'sqlite',
      type: 'sqlite'
    })

test('Events can be emitted from plugins', async () => {
  const listener = jest.fn()

  const event_name = 'user::registered'

  const event_payload = {
    user: {
      id: 1
    }
  }

  const {
    ctx: { emitter }
  } = await setup()
    .events([event(event_name).listen(({ payload }) => listener(payload))])
    .start(() => {}, false)

  await emitter.emit(event_name, event_payload)

  expect(listener).toHaveBeenCalledWith(event_payload)
})
