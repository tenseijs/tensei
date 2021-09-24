/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'

import { Parser } from '../src/Parser'
import { args } from '../src/Decorators/args'
import { BaseCommand } from '../src/BaseCommand'

test.group('Parser | flags', () => {
  test('parse flags as boolean', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'boolean' as 'boolean',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    const output = parser.parse(['--admin=true'])
    assert.deepEqual(output, { _: [], admin: true })
  })

  test('do not parse string values as true', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'boolean' as 'boolean',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    assert.throw(
      () => parser.parse(['--admin=yes']),
      'E_INVALID_FLAG: "admin" flag expects a "boolean" value'
    )
  })

  test('parse negative flags as boolean', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'boolean' as 'boolean',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    const output = parser.parse(['--no-admin'])
    assert.deepEqual(output, { _: [], admin: false })
  })

  test('set flag to true when its undefined', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'boolean' as 'boolean',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    const output = parser.parse(['--admin'])
    assert.deepEqual(output, { _: [], admin: true })
  })

  test('do not set boolean flag when it is not mentioned', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'boolean' as 'boolean',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    const output = parser.parse([])
    assert.deepEqual(output, { _: [] })
  })

  test('parse flags as string', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'string' as 'string',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    const output = parser.parse(['--admin=true'])
    assert.deepEqual(output, { _: [], admin: 'true' })
  })

  test('do not define string flag when it is not mentioned', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'string' as 'string',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    const output = parser.parse([])
    assert.deepEqual(output, { _: [] })
  })

  test('raise error when string flag is used without value', (assert) => {
    const parser = new Parser({
      admin: {
        type: 'string' as 'string',
        name: 'admin',
        propertyName: 'admin',
        handler: () => {},
      },
    })

    assert.throw(
      () => parser.parse(['--admin']),
      'E_INVALID_FLAG: "admin" flag expects a "string" value'
    )
  })

  test('set flag to number', (assert) => {
    const parser = new Parser({
      age: {
        type: 'number' as 'number',
        name: 'age',
        propertyName: 'age',
        handler: () => {},
      },
    })

    const output = parser.parse(['--age=22'])
    assert.deepEqual(output, { _: [], age: 22 })
  })

  test('set number like values as string when defined as string', (assert) => {
    const parser = new Parser({
      age: {
        type: 'string' as 'string',
        name: 'age',
        propertyName: 'age',
        handler: () => {},
      },
    })

    const output = parser.parse(['--age=22'])
    assert.deepEqual(output, { _: [], age: '22' })
  })

  test('raise error when number flag receives a string', (assert) => {
    const parser = new Parser({
      age: {
        type: 'number' as 'number',
        name: 'age',
        propertyName: 'age',
        handler: () => {},
      },
    })

    const output = () => parser.parse(['--age=foo'])
    assert.throw(output, 'E_INVALID_FLAG: "age" flag expects a "numeric" value')
  })

  test('raise error when number flag receives a boolean', (assert) => {
    const parser = new Parser({
      age: {
        type: 'number' as 'number',
        name: 'age',
        propertyName: 'age',
        handler: () => {},
      },
    })

    const output = () => parser.parse(['--age'])
    assert.throw(output, 'E_INVALID_FLAG: "age" flag expects a "numeric" value')
  })

  test('parse value as an array of strings', (assert) => {
    const parser = new Parser({
      names: {
        type: 'array' as 'array',
        name: 'names',
        propertyName: 'names',
        handler: () => {},
      },
    })

    const output = parser.parse(['--names=virk'])
    assert.deepEqual(output, { _: [], names: ['virk'] })
  })

  test('parse value as an array of strings when passed for multiple times', (assert) => {
    const parser = new Parser({
      names: {
        type: 'array' as 'array',
        name: 'names',
        propertyName: 'names',
        handler: () => {},
      },
    })

    const output = parser.parse(['--names=virk', '--names=nikk'])
    assert.deepEqual(output, { _: [], names: ['virk', 'nikk'] })
  })

  test('parse value as an array of strings when defined a numeric value', (assert) => {
    const parser = new Parser({
      names: {
        type: 'array' as 'array',
        name: 'names',
        propertyName: 'names',
        handler: () => {},
      },
    })

    const output = parser.parse(['--names=22'])
    assert.deepEqual(output, { _: [], names: ['22'] })
  })

  test('parse value as an array of strings when defined a numeric value multiple times', (assert) => {
    const parser = new Parser({
      names: {
        type: 'array' as 'array',
        name: 'names',
        propertyName: 'names',
        handler: () => {},
      },
    })

    const output = parser.parse(['--names=22', '--names=foo'])
    assert.deepEqual(output, { _: [], names: ['22', 'foo'] })
  })

  test('raise error when array receives a boolean', (assert) => {
    const parser = new Parser({
      names: {
        type: 'array' as 'array',
        name: 'names',
        propertyName: 'names',
        handler: () => {},
      },
    })

    assert.throw(
      () => parser.parse(['--names']),
      'E_INVALID_FLAG: "names" flag expects an "array of strings" value'
    )
  })

  test('parse value as an array of number', (assert) => {
    const parser = new Parser({
      scores: {
        type: 'numArray' as 'numArray',
        name: 'scores',
        propertyName: 'scores',
        handler: () => {},
      },
    })

    const output = parser.parse(['--scores=10'])
    assert.deepEqual(output, { _: [], scores: [10] })
  })

  test('parse value as an array of numbers when passed for multiple times', (assert) => {
    const parser = new Parser({
      scores: {
        type: 'numArray' as 'numArray',
        name: 'scores',
        propertyName: 'scores',
        handler: () => {},
      },
    })

    const output = parser.parse(['--scores=10', '--scores=20'])
    assert.deepEqual(output, { _: [], scores: [10, 20] })
  })

  test('raise error when one of the array value is not a number', (assert) => {
    const parser = new Parser({
      scores: {
        type: 'numArray' as 'numArray',
        name: 'scores',
        propertyName: 'scores',
        handler: () => {},
      },
    })

    assert.throw(
      () => parser.parse(['--scores=10', '--scores=foo']),
      'E_INVALID_FLAG: "scores" flag expects an "array of numbers" value'
    )

    assert.throw(
      () => parser.parse(['--scores=foo']),
      'E_INVALID_FLAG: "scores" flag expects an "array of numbers" value'
    )

    assert.throw(
      () => parser.parse(['--scores=foo,22']),
      'E_INVALID_FLAG: "scores" flag expects an "array of numbers" value'
    )
  })
})

test.group('Parser | args', () => {
  test('parse string arguments', (assert) => {
    class Greet extends BaseCommand {
      @args.string()
      public name: string

      public async handle() {}
    }

    const parser = new Parser({})

    const output = parser.parse(['virk'], Greet)
    assert.deepEqual(output, { _: ['virk'] })
  })

  test('mark argument as optional', (assert) => {
    class Greet extends BaseCommand {
      @args.string({ required: false })
      public name: string

      public async handle() {}
    }

    const parser = new Parser({})

    const output = parser.parse([], Greet)
    assert.deepEqual(output, { _: [] })
  })
})
