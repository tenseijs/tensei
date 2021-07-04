import * as CSS from 'csstype'
import { Request } from 'express'
import { paramCase, pascalCase } from 'change-case'
import { CardConfig, Width, CardContract } from '@tensei/common'

export class Card implements CardContract {
  name: string = ''

  slug: string = ''

  public background: string = '#fff'

  public backgroundImage: string = ''

  public text: string = '#000'

  public customStyles: CSS.Properties = {}

  public config: CardConfig = {
    width: '1/3',
    component: ''
  }

  public request: Request | null = null

  public setRequest(request: Request) {
    this.request = request

    return this
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

  public bg(background: string) {
    this.background = background

    return this
  }

  public bgImage(backgroundImage: string) {
    this.backgroundImage = backgroundImage

    return this
  }

  public styles(styles: CSS.Properties) {
    this.customStyles = styles

    return this
  }

  public textColor(textColor: string) {
    this.text = textColor

    return this
  }

  public serialize() {
    return {
      name: this.name,
      slug: this.slug,
      textColor: this.text,
      width: this.config.width,
      background: this.background,
      customStyles: this.customStyles,
      component: this.config.component,
      backgroundImage: this.backgroundImage
    }
  }
}

export const card = (name: string, slug?: string) => new Card(name, slug)
