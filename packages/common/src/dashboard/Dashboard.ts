import { paramCase } from 'change-case'
import {
  CardContract,
  DashboardConfig,
  SerializedDashboardContract,
  DashboardContract
} from '@tensei/common'

export class Dashboard implements DashboardContract {
  public config: DashboardConfig = {
    name: '',
    slug: '',
    cards: [],
    group: 'Dashboards',
    displayInNavigation: true
  }

  constructor(name: string, slug?: string) {
    this.config.name = name
    this.config.slug = slug || paramCase(name)
  }

  cards(cards: CardContract[]) {
    this.config.cards = cards

    return this
  }

  group(group: string) {
    this.config.group = group

    return this
  }

  public serialize(): SerializedDashboardContract {
    return {
      name: this.config.name,
      slug: this.config.slug,
      group: this.config.group,
      groupSlug: paramCase(this.config.group),
      displayInNavigation: this.config.displayInNavigation,
      cards: this.config.cards.map(card => card.serialize())
    }
  }

  public hideFromNavigation() {
    this.config.displayInNavigation = false

    return this
  }
}

export const dashboard = (name: string, slug?: string) =>
  new Dashboard(name, slug)
