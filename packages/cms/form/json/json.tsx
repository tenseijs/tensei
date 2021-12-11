import React from 'react'
import styled from 'styled-components'
import { EuiText } from '@tensei/eui/lib/components/text'
import { Controlled as CodeMirror } from 'react-codemirror2'

import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/display/autorefresh'

import { FormComponentProps } from '@tensei/components'

const Wrapper = styled.div<{
  focus?: boolean
}>`
  ${({ theme, focus }) => `
    .react-codemirror2 {
      cursor: text;
      background-repeat: no-repeat;
      background-size: 0% 100%;
      padding: 12px;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
      background-color: ${theme.colors.formControlBackground};
      box-shadow: ${theme.colors.formControlBoxShadow};

      transition: box-shadow 150ms ease-in, background-image 150ms ease-in, background-size 150ms ease-in, background-color 150ms ease-in;

      ${
        focus
          ? `
      background-color: #FFF;
      background-image: ${theme.colors.formControlBgImage};
      background-size: 100% 100%;
      outline: none;
      box-shadow: inset 0 0 0 1px rgb(69 45 164 / 10%);
      `
          : ``
      }
  }

  .CodeMirror {
    height: auto;
    font-family: ${theme.font.familyCode};
  }

  .CodeMirror-scroll {
    min-height: 6rem;
    background-color: ${
      focus
        ? theme.colors.formControlBgImage
        : theme.colors.formControlBackground
    };
  }
`}
`

const JsonHeader = styled.div`
  ${() => `
    padding: 6px 12px;
    font-weight: 500;
    background-color: #fcfcfc;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    border: 1px solid rgb(69 45 164 / 10%);
    border-bottom: none;
  `}
`

const FormJson: React.FC<FormComponentProps> = ({
  field,
  value,
  onChange,
  onFocus,
  activeField
}) => {
  const focused = activeField?.databaseField === field.databaseField

  return (
    <Wrapper focus={focused}>
      <JsonHeader>
        <EuiText size="xs">JSON TEXT</EuiText>
      </JsonHeader>
      <CodeMirror
        value={value}
        options={{
          autoCloseBrackets: true,
          mode: { name: 'javascript', json: true },
          lineWrapping: true,
          viewportMargin: Infinity,
          indentUnit: 4,
          indentWithTabs: true,
          // @ts-ignore
          height: 'auto',
          theme: 'none',
          autoRefresh: true
        }}
        autoCursor
        onBeforeChange={(editor, data, value) => {
          onChange(value)
        }}
        onFocus={onFocus}
        {...field.attributes}
      />
    </Wrapper>
  )
}

export default FormJson
