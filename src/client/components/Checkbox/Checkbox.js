import React from 'react'

const Checkbox = ({ onChange, checked, label }) => (
    <label className="form-check">
        <input
            checked={checked}
            onChange={onChange}
            className="form-check-input"
            type="checkbox"
        />
        {label && <span className="form-check-label">{label}</span>}
    </label>
)

export default Checkbox
