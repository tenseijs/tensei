import React from 'react'

export interface PulseProps {
    className?: string
    dotClassName?: string
    width?: string
    height?: string
}

const Pulse: React.FC<PulseProps> = ({
    dotClassName = '',
    className = '',
    width = '40px',
    height = '40px'
}) => (
    <div
        className={`${className} sk-flow`}
        style={{
            width: `calc(${width} * 1.3)`,
            height: `calc(${height} * 1.3)`
        }}
    >
        <div className={`sk-flow-dot ${dotClassName}`}></div>
        <div className={`sk-flow-dot ${dotClassName}`}></div>
        <div className={`sk-flow-dot ${dotClassName}`}></div>
    </div>
)

export default Pulse
