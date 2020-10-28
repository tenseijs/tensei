import React from 'react'
import cn from 'classnames'
import { TextLink } from '@contentful/forma-36-react-components'

class Textarea extends React.Component {
    state = {
        showingContent: false,
    }

    render() {
        const { showingContent } = this.state
        const { value, ...rest } = this.props

        return (
            <div className="flex flex-col">
                {showingContent ? <div dangerouslySetInnerHTML={{
                    __html: value
                }}></div> : null}
                <TextLink
                    className={cn({
                        'mt-3': showingContent,
                    })}
                    onClick={() =>
                        this.setState({ showingContent: !showingContent })
                    }
                >
                    {showingContent ? 'Hide content' : 'Show content'}
                </TextLink>
            </div>
        )
    }
}

export default Textarea
