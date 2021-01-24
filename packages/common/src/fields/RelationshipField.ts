import Field from './Field'
import Pluralize from 'pluralize'
import { snakeCase } from 'change-case'
import { Cascade } from '@mikro-orm/core'

// This would be BelongsTo in other relationship language.
export class RelationshipField extends Field {
    public isRelationshipField: boolean = true

    /**
     * Will be used as the label for showing
     * this field on forms
     *
     */
    public relationshipLabel: string = ''

    /**
     * When a new date string is initialized, it defaults the
     * date to today's date.
     */
    constructor(name: string, databaseField = Pluralize(snakeCase(name))) {
        super(name, databaseField)

        this.hideOnIndex()
        this.dockToSidebarOnForms()

        this.relationshipLabel = name
    }

    public cascades(cascades: Cascade[]) {
        this.property.cascade = cascades

        return this
    }

    public owner() {
        this.relatedProperty.owner = true

        return this
    }

    public alwaysLoad() {
        this.relatedProperty.eager = true

        return this
    }

    public label(label: string) {
        this.relationshipLabel = label

        return this
    }

    public foreignKey(foreignKey: string) {
        return this
    }

    public serialize() {
        return {
            ...super.serialize(),
            label: this.relationshipLabel
        }
    }
}

export default RelationshipField
