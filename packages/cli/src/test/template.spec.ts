/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { join } from 'path'
import { template, templateFromFile } from '../src/utils/template'

test.group('template', () => {
  test('interpolate valid template', (assert) => {
    const result = template('${test} ${other}', {
      test: 123,
      other: 'hello',
    })
    assert.strictEqual(result, '123 hello')
  })

  test('raise error when value is missing', (assert) => {
    const fn = () => template('${test} ${other}', {})
    assert.throw(fn, 'Error in template eval:1:1\ntest is not defined')
  })

  test('interpolate template using mustache', (assert) => {
    const result = template(
      '{{test}} {{other}}',
      {
        test: 123,
        other: 'hello',
      },
      undefined,
      true
    )
    assert.strictEqual(result, '123 hello')
  })

  test('interpolate function calls', (assert) => {
    const result = template('${test()}', {
      test: () => 123,
    })
    assert.strictEqual(result, '123')
  })

  test('interpolate property accessor', (assert) => {
    const result = template('${user.name}', {
      user: { name: 'virk' },
    })
    assert.strictEqual(result, 'virk')
  })
})

test.group('Template From File', () => {
  test('interpolate valid template', (assert) => {
    const result = templateFromFile(
      join(__dirname, 'fixtures/template1.txt'),
      {
        value1: 'World',
        value2: 42,
      },
      false
    )

    assert.strictEqual(result, 'Hello World, 42')
  })

  test('raise error when values is missing', (assert) => {
    const file = join(__dirname, 'fixtures/template1.txt')
    const fn = () => templateFromFile(file, {}, false)
    assert.throw(fn, `Error in template ${file}:1:10\nvalue1 is not defined`)
  })

  test('error if file is missing', (assert) => {
    assert.throws(() => templateFromFile(join(__dirname, 'fixtures/i-do-not-exist'), {}, false))
  })

  test('interpolate mustache from template file', (assert) => {
    const result = templateFromFile(
      join(__dirname, 'fixtures/template1.mustache'),
      {
        value1: 'World',
        value2: 42,
      },
      true
    )
    assert.strictEqual(result.trim(), 'Hello World, 42')
  })
})
