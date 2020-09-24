import React from 'react'
import { Card } from '@contentful/forma-36-react-components'

class ValueMetric extends React.Component {
    componentDidMount() {
        this.fetch()
    }

    fetch = () => {
        Tensei.request.get(
            `metrics/${this.props.dashboard.slug}/${this.props.card.slug}`
        )
    }

    render() {
        const { card } = this.props

        return (
            <Card className="h-full">
                <div className="h-full flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                        <h6 className="font-medium ">{card.name}</h6>

                        <div className="w-1/5">
                            <select className="text-xs bg-gray-lightest-100 p-1 rounded-sm ">
                                {Object.keys(card.ranges).map((range) => (
                                    <option value={range} key={range}>
                                        {card.ranges[range]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <h2 className="font-bold text-2xl">6,0399</h2>

                    <p className="font-medium">99% Decrease</p>
                </div>
            </Card>
        )
    }
}

export default ValueMetric
