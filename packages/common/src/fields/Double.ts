import Integer from './Integer'

export class Double extends Integer {
  constructor(name: string, databaseField?: string) {
    super(name, databaseField)

    this.property.type = 'double'
    this.property.columnTypes = ['double']
  }

  public afterConfigSet() {
    super.afterConfigSet()

    if (this.tenseiConfig?.databaseConfig.type === 'postgresql') {
      this.property.columnTypes = ['double precision']
    }
  }
}

export const double = (name: string, databaseField?: string) =>
  new Double(name, databaseField)

export default Double
