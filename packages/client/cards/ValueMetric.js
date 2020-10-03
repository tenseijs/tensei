import React from 'react'
import { Card, Spinner } from '@contentful/forma-36-react-components'

class ValueMetric extends React.Component {
    state = {
        range:
            this.props.card.ranges.length > 0
                ? this.props.card.ranges[0].value
                : '',
        result: {
            value: 0,
            previousValue: 0,
            locale: 'en-US',
            options: {}
        },
        loading: true
    }

    componentDidMount() {
        this.fetch()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.range !== this.state.range) {
            this.fetch()
        }
    }

    fetch = () => {
        this.setState({
            loading: true
        })

        Tensei.request
            .get(
                `metrics/${this.props.dashboard.slug}/${this.props.card.slug}?range=${this.state.range}`
            )
            .then(({ data }) => {
                this.setState({
                    result: data,
                    loading: false
                })
            })
    }

    calculateDifference = () => {
        const { result } = this.state

        return result.value > result.previousValue
            ? result.value - result.previousValue
            : result.previousValue - result.value
    }

    formatValue = () => {
        const { result } = this.state

        return new Intl.NumberFormat(result.locale || 'en-US', {
            ...result.options
        }).format(result.value)
    }

    calculatePercentage = () => {
        const { result } = this.state

        const difference = this.calculateDifference()

        if (difference === 0) {
            return 0
        }

        return new Intl.NumberFormat(result.locale || 'en-US', {
            maximumSignificantDigits: 2,
            ...result.options
        }).format((difference / result.value) * 100)
    }

    getPercentageText = () => {
        const { result } = this.state

        const difference = result.value - result.previousValue

        if (difference === 0) {
            return ' No change'
        }

        if (difference > 0) {
            return ' Increase'
        }

        return ' Decrease'
    }

    renderIcon = percentageText => {
        let className = ['fill-current mr-2']

        if (percentageText === ' Decrease') {
            className.push('text-red-500')
        }

        if (percentageText === ' Increase') {
            className.push('text-green-500', 'transform rotate-180')
        }

        return (
            <svg width={20} height={12} className={className.join(' ')}>
                <path d="M2 3a1 1 0 0 0-2 0v8a1 1 0 0 0 1 1h8a1 1 0 0 0 0-2H3.414L9 4.414l3.293 3.293a1 1 0 0 0 1.414 0l6-6A1 1 0 0 0 18.293.293L13 5.586 9.707 2.293a1 1 0 0 0-1.414 0L2 8.586V3z" />
            </svg>
        )
    }

    render() {
        const { card } = this.props
        const { loading } = this.state

        const percentage = this.calculatePercentage()
        const percentageText = this.getPercentageText()

        return (
            <Card
                className="h-full"
                style={{
                    borderRadius: '0.25rem',
                    background: card.backgroundImage
                        ? `url(${card.backgroundImage})`
                        : card.background,
                    color: card.textColor,
                    ...card.customStyles
                }}
            >
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <Spinner size="large" />
                    </div>
                ) : (
                    <div className="h-full flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                            <h6 className="font-medium ">{card.name}</h6>

                            <div className="w-2/5 md:w-1/5">
                                <select
                                    style={card.selectStyles}
                                    onChange={event =>
                                        this.setState({
                                            range: event.target.value
                                        })
                                    }
                                    value={this.state.range}
                                    className="w-full text-xs bg-gray-lightest-100 p-1 rounded-sm "
                                >
                                    {card.ranges.map(range => (
                                        <option
                                            value={range.value}
                                            key={range.value}
                                        >
                                            {range.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <h2 className="font-bold text-2xl">
                            {this.formatValue()}
                        </h2>

                        <p className="font-bold flex items-center">
                            {this.renderIcon(percentageText)}
                            {percentage > 0 ? `${percentage}%` : ''}
                            {percentageText}
                        </p>
                    </div>
                )}
            </Card>
        )
    }
}

export default ValueMetric
