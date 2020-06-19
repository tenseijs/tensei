import Article from '../mocks/resources/Article'
import Controller from '../../controllers/Controller'

test('can get validation rules from resource correctly', async () => {
    const rules = new Controller().getValidationRules(new Article({}))

    expect(rules).toMatchInlineSnapshot(`
        Object {
          "publishedAt": "required|date",
          "title": "required|string|min:6|max:20",
        }
    `)
})

test('can validate data correctly for a resource', async () => {
    const [validationFailed, errors] = await new Controller().validate(
        {
            publishedAt: 'WRONG-DATE-FORMAT',
        },
        new Article({})
    )

    expect(validationFailed).toBe(true)
    expect(errors).toMatchInlineSnapshot(`
        Object {
          "publishedAt": "The date field must be a valid date format.",
          "title": "The title field is required.",
        }
    `)
})
