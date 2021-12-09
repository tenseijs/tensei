import React, { useEffect } from 'react'
import styled from 'styled-components'
import { FormComponentProps } from '@tensei/components'
import {
  EuiButtonEmpty,
  EuiButton,
  EuiButtonIcon
} from '@tensei/eui/lib/components/button'
import { EuiBadge } from '@tensei/eui/lib/components/badge'
import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiFlexGroup, EuiFlexItem } from '@tensei/eui/lib/components/flex'
import { useGeneratedHtmlId } from '@tensei/eui/lib/services'
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiFlyoutFooter
} from '@tensei/eui/lib/components/flyout'
import { useState } from 'react'
import { Resource } from '../../pages/resources/resource'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 6px;
`

const SelectedDocument = styled.div`
  ${({ theme }) => `
    border: ${theme.border.thin};
    padding: 8px 12px;
    width: 100%;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `}
`

const ResourceNameWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const DocumentActions = styled.div`
  gap: 8px;
  display: flex;
  align-items: center;
`

export const BelongsToMany: React.FunctionComponent<FormComponentProps> = ({
  field,
  onChange,
  editingId,
  editing,
  resource
}) => {
  const [documents, setDocuments] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [flyOutOpen, setFlyoutOpen] = useState(false)
  const flyOutId = useGeneratedHtmlId()
  const relatedResource = window.Tensei.state.resourcesMap[field.name]

  function closeFlyout() {
    setFlyoutOpen(false)
  }

  async function fetchDocuments() {
    if (!editing || !editingId) {
      return
    }

    const [response, error] = await window.Tensei.api.get(
      `${resource?.slugPlural}/${editingId}/${relatedResource?.slugPlural}`
    )

    if (!error) {
      setDocuments(response?.data.data)
    }
  }

  useEffect(() => {
    onChange(documents.map(document => document.id))
  }, [documents])

  useEffect(() => {
    fetchDocuments()
  }, [])

  return (
    <>
      {flyOutOpen ? (
        <EuiFlyout
          ownFocus
          onClose={closeFlyout}
          size={'l'}
          aria-labelledby={flyOutId}
        >
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="m">
              <h2 id={flyOutId}>Add existing {relatedResource?.label}</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <Resource
              resource={relatedResource}
              tableProps={{ onSelect: setSelectedItems }}
            />
          </EuiFlyoutBody>

          <EuiFlyoutFooter>
            <EuiFlexGroup justifyContent="spaceBetween">
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  iconType="cross"
                  onClick={closeFlyout}
                  flush="left"
                >
                  Close
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  disabled={selectedItems.length === 0}
                  onClick={() => {
                    setDocuments(selectedItems)
                    closeFlyout()
                  }}
                  fill
                >
                  Add selected {relatedResource?.label}
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlyoutFooter>
        </EuiFlyout>
      ) : null}
      <Wrapper>
        {documents.map(item => (
          <SelectedDocument key={item.id}>
            <ResourceNameWrapper>
              <EuiBadge color="hollow">{relatedResource?.name}</EuiBadge>

              <EuiText size="s">
                {item[relatedResource?.displayFieldSnakeCase]}
              </EuiText>
            </ResourceNameWrapper>

            <DocumentActions>
              <EuiBadge color="success">Published</EuiBadge>

              <EuiButtonIcon
                iconType="trash"
                color="accent"
                onClick={() => {
                  setDocuments(
                    documents.filter(document => document.id !== item.id)
                  )
                }}
                aria-label={`Remove ${relatedResource?.label}`}
              />
            </DocumentActions>
          </SelectedDocument>
        ))}

        <div>
          <EuiButtonEmpty
            onClick={() => setFlyoutOpen(true)}
            size="xs"
            iconType="link"
          >
            Add existing {relatedResource?.label}
          </EuiButtonEmpty>
        </div>
      </Wrapper>
    </>
  )
}
