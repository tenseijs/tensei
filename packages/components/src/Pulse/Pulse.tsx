import React from 'react'

export interface PulseProps {
  className?: string
  dotClassName?: string
  width?: string
  height?: string
  dotHeight?: string
}

const Pulse: React.FC<PulseProps> = ({
  dotClassName = '',
  className = '',
  width = '40px',
  height = '40px',
  dotHeight = '25%'
}) => (
  <div
    className={`${className} sk-flow`}
    style={{
      width: `calc(${width} * 1.3)`,
      height: `calc(${height} * 1.3)`
    }}
  >
    <div
      style={{ height: dotHeight }}
      className={`sk-flow-dot ${dotClassName}`}
    ></div>
    <div
      style={{ height: dotHeight }}
      className={`sk-flow-dot ${dotClassName}`}
    ></div>
    <div
      style={{ height: dotHeight }}
      className={`sk-flow-dot ${dotClassName}`}
    ></div>
  </div>
)

export default Pulse
