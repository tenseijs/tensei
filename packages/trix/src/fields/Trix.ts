import { Textarea } from 'plugins/node_modules/@tensei/common'

export class Trix extends Textarea {}

/**
 * Instantiate a new field. Requires the name,
 * and optionally the corresponding database
 * field. This field if not provided will
 * default to the camel case version of
 * the name.
 *
 * @param name Instantiate a new trix field. Requires the name
 *
 * @param databaseField
 */
export const trix = (name: string, databaseField?: string) =>
    new Trix(name, databaseField)
