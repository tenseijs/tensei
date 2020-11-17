import React from 'react'
import TrixLibrary from 'trix'

class Trix extends React.Component {
    constructor(props) {
        super(props)

        this.input = React.createRef()
    }

    componentDidMount() {
        this.input.current.addEventListener('trix-change', event => {
            this.props.onFieldChange(event.target.innerHTML)
        })
    }

    render() {
        const { value, onChange, field } = this.props

        return (
            <>
                <div className="TextField">
                    <div className="TextField__label-wrapper">
                        <label className="FormLabel" htmlFor={field.inputName}>
                            {field.name}
                        </label>
                    </div>

                    <input type='hidden' id='trix' value={value} />
                    <trix-editor input='trix' ref={this.input} />
                </div>
            </>
        )
    }
}

export default Trix
