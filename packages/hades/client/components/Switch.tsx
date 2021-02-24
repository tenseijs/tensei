import React from 'react'

interface SwitchProps {
    planInterval: 'monthly' | 'yearly'
    onPlanIntervalChange: () => void
}

const Switch: React.FC<SwitchProps> = ({ onPlanIntervalChange, planInterval }) => {
    return (
        <div className="flex items-center">
        <span className="font-bold text-sm text-gray-600 uppercase">
            Monthly
        </span>

        <button role="checkbox" tabIndex={0} onClick={onPlanIntervalChange} aria-checked="false" className="bg-gray-800 ml-3 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none">
            <span aria-hidden="true" className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200 ${planInterval === 'monthly' ? 'translate-x-0' : 'translate-x-5'}`}>
            </span>
        </button>

        <span className="ml-3 font-bold text-sm text-gray-600 uppercase">
            Yearly
        </span>
    </div>
    )
}

export default Switch
