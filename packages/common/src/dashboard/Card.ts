import { paramCase, pascalCase } from 'change-case'
import { CardConfig, Width, CardContract } from '@tensei/common'

export class Card implements CardContract {
    name: string = ''

    slug: string = ''

    public config: CardConfig = {
        width: '1/3',
        component: '',
    }

    constructor(name: string, slug?: string) {
        this.name = name
        this.slug = slug || paramCase(name)

        this.config.component = pascalCase(`${name}Card`)
    }

    public width(width: Width) {
        this.config.width = width

        return this
    }

    component(component: string) {
        this.config.component = component

        return this
    }

    public serialize() {
        return {
            name: this.name,
            slug: this.slug,
            width: this.config.width,
            component: this.config.component,
        }
    }
}

export const card = (name: string, slug?: string) => new Card(name, slug)
