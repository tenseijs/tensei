import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import ReactMde, { ReactMdeProps } from 'react-mde'

import { FormComponentProps, DetailComponentProps } from '@tensei/components'

import './mde.css'
import 'react-mde/lib/styles/css/react-mde-all.css'

export interface MdeProps extends FormComponentProps {}

const Mde: React.FC<MdeProps> = ({ field, id, name, onChange, value }) => {
    const [tab, setTab] = useState<ReactMdeProps['selectedTab']>('write')

    return (
        <div>
            {field.name && (
                <label
                    htmlFor={id}
                    className={
                        'font-semibold text-tensei-darkest inline-block mb-2'
                    }
                >
                    {field.name}
                </label>
            )}

            <ReactMde
                value={value}
                selectedTab={tab}
                onChange={onChange}
                onTabChange={setTab}
                classes={{
                    textArea:
                        'block w-full pr-10 pl-3 leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-tensei-primary border border-tensei-gray-600 focus:border-tensei-primary'
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

const DetailMde: React.FC<DetailComponentProps> = ({ value, ...rest }) => {
    return (
        <window.Tensei.components.detail.Textarea {...rest}>
            <ReactMarkdown source={value} />
        </window.Tensei.components.detail.Textarea>
    )
}

export default Mde

window.Tensei.register(({ formComponent, detailComponent }) => {
    formComponent('Mde', Mde)
    detailComponent('Mde', DetailMde)
})
