import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import ReactMde, { ReactMdeProps } from 'react-mde'

import './mde.css'
import 'react-mde/lib/styles/css/react-mde-all.css'

export interface MdeProps {
    label: string
    id?: string
    name?: string
}

const Mde: React.FC<MdeProps> = ({ label, id, name }: MdeProps) => {
    const [value, setValue] = useState<string>('')
    const [tab, setTab] = useState<ReactMdeProps['selectedTab']>('write')

    return (
        <div>
            {label && (
                <label
                    htmlFor={id}
                    className={'text-tensei-darkest inline-block mb-2'}
                >
                    {label}
                </label>
            )}

            <ReactMde
                value={value}
                selectedTab={tab}
                onChange={setValue}
                onTabChange={setTab}
                classes={{
                    textArea:
                        'block w-full pr-10 pl-3 leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-tensei-primary border border-tensei-gray-600 focus:border-tensei-primary sm:text-sm'
                }}
                generateMarkdownPreview={(markdown: string) =>
                    Promise.resolve(<ReactMarkdown source={markdown} />)
                }
                childProps={{
                    writeButton: {
                        tabIndex: -1
                    },
                    textArea: {
                        id,
                        name
                    }
                }}
                paste={{
                    saveImage: console.log as any
                }}
            />
        </div>
    )
}

export default Mde

window.Tensei.register(({ formComponent, indexComponent, detailComponent }) => {
    formComponent('Mde', Mde)
    indexComponent('Mde', Mde)
    detailComponent('Mde', Mde)
})
