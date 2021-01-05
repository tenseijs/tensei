import React from 'react'

interface SettingsPageProps {}

const Settings: React.FC<SettingsPageProps> = () => {
    return (
        <div className="h-full flex overflow-hidden">
            <div className="hidden bg-white border-r border-tensei-gray-400 md:flex md:flex-shrink-0">
                <div className="flex flex-col w-80">
                    <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4"></div>
                        <div className="mt-5 flex-1 flex flex-col">
                            {/* <Nav className="flex-1 space-y-1 mt-3" /> */}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-0 flex-1 overflow-hidden"></div>
        </div>
    )
}

export default Settings
