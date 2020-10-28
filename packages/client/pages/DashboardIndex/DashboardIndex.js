import React from 'react'
import { withResources } from '~/store/resources'

import { Heading } from '@contentful/forma-36-react-components'

class DashboardIndex extends React.Component {
    state = this.defaultState()

    findDashboard() {
        return this.props.dashboards.find(
            dashboard => dashboard.slug === this.props.match.params.dashboard
        )
    }

    defaultState() {
        const dashboard = this.findDashboard()

        return {
            dashboard
        }
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.match.params.dashboard !==
            this.props.match.params.dashboard
        ) {
            this.bootComponent()
        }
    }

    bootComponent = () => {
        this.setState(this.defaultState())
    }

    renderCard = card => {
        const Card = Tensei.cardComponents[card.component]

        if (!Card) {
            return null
        }

        return <Card card={card} dashboard={this.state.dashboard} />
    }

    render() {
        console.log(this.props)
        const { dashboard } = this.state

        // TODO: Redirect to 404 page
        if (!dashboard) return null

        return (
            <>
                <div className="p-3">
                    <Heading>{dashboard.name} dashboard</Heading>
                </div>

                <div className="flex flex-wrap mt-3">
                    {dashboard.cards.map(card => (
                        <div
                            key={card.slug}
                            style={{ height: '11.375rem' }}
                            className={`p-2 w-full md:w-${card.width}`}
                        >
                            {this.renderCard(card)}
                        </div>
                    ))}
                </div>
            </>
        )
    }
}

export default withResources(DashboardIndex)
