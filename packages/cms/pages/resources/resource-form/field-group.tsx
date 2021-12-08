import React from 'react'
import styled from 'styled-components'
const FieldGroupWrapper = styled.div<{
  focused?: boolean
}>`
  width: 100%;
  margin-bottom: 24px;
  padding-left: 20px;
  transition: all 0.25s ease-in-out;
  border-left: ${({ theme, focused }) =>
    `3px solid ${focused ? theme.colors.primary : theme.border.color}`};
`

interface FieldGroupProps {
  focused?: boolean
}

export const FieldGroup: React.FunctionComponent<FieldGroupProps> = ({
  focused,
  children
}) => {
  return <FieldGroupWrapper focused={focused}>{children}</FieldGroupWrapper>
}
