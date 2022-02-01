import React, { FunctionComponent, useEffect, useState } from 'react'
import styled from 'styled-components'

import { DashboardLayout } from '../../components/dashboard/layout'

import { EuiFieldNumber } from '@tensei/eui/lib/components/form'
import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import {
  EuiButtonEmpty,
  EuiButton,
  EuiButtonIcon
} from '@tensei/eui/lib/components/button'
import { EuiFieldSearch } from '@tensei/eui/lib/components/form/field_search'
import { EuiPopover } from '@tensei/eui/lib/components/popover'
import { EuiContextMenu } from '@tensei/eui/lib/components/context_menu'
import { EuiFilePicker } from '@tensei/eui/lib/components/form'
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiFlexGrid
} from '@tensei/eui/lib/components/flex'
import { EuiPagination } from '@tensei/eui/lib/components/pagination'
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader
} from '@tensei/eui/lib/components/flyout'
import { EuiModal } from '@tensei/eui/lib/components/modal/modal'
import { EuiConfirmModal } from '@tensei/eui/lib/components/modal/confirm_modal'
import { EuiCard } from '@tensei/eui/lib/components/card'
import moment from 'moment'

import { useGeneratedHtmlId } from '@tensei/eui/lib/services/accessibility'

const PageWrapper = styled.div`
  width: 100%;
  padding: 40px;
  margin-bottom: 20px;
`

const SearchAndFilterContainer = styled.div`
  display: flex;
  width: 50%;
  align-items: center;
  justify-content: space-between;
  margin-top: -20px;
`

const AssetPopover = styled(EuiPopover)`
  margin-left: 10px;
`

const AssetContainer = styled.div`
  max-width: 100%;
  padding: 25px 0;
`

const AssetWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 1.5rem;
`

const AssetCard = styled(EuiCard)`
  width: 220px;
  height: 230px;
`

const AssetCardImage = styled.img`
  display: block;
  background-color: ${({ theme }) => theme.colors.bgShade};
  margin-bottom: 20px;
`

const NumberFieldAndPagination = styled.div`
  display: flex;
  justify-content: space-between;
`

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`

const NumberFieldWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
`

const FieldNumber = styled(EuiFieldNumber)`
  width: 65px;
`

const AssetFlyout = styled(EuiFlyout)`
  box-shadow: none;
  border-left: ${({ theme }) => theme.border.thin};
`

const AssetFlyoutImage = styled.img`
  width: 100%;
  height: 25vh;
  margin-top: 20px;
`

const FlyoutHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: -20px;
`

const FlyoutBodyContent = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`

const ModalWrapper = styled(EuiModal)`
  padding: 30px;
  margin-bottom: 0;
`

const ModalContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`

const ConfirmModal = styled(EuiConfirmModal)`
  width: 400px;
  height: 230px;
`

interface assetData {
  name: string
  path: string
  createdAt: string
  width: string
  height: string
  size: number
  extension: string
  file: string
  altText: string
}

export const AssetManager: FunctionComponent = () => {
  const [isDestroyModalVisible, setIsDestroyModalVisible] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false)

  const closeDestroyModal = () => setIsDestroyModalVisible(false)
  const showDestroyModal = () => setIsDestroyModalVisible(true)

  const closeModal = () => setIsModalVisible(false)
  const showModal = () => setIsModalVisible(true)
  const [assets, setAssets] = useState([])
  const [active, setActive] = useState<assetData>()

  const [activePage, setActivePage] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  useEffect(() => {
    const fetchFiles = async () => {
      const [data, error] = await window.Tensei.api.get('files')
      if (!error) {
        setAssets(data?.data.data)
      }
    }
    fetchFiles()
  }, [])

  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: 'simpleFlyoutTitle'
  })

  let destroyModal

  if (isDestroyModalVisible) {
    destroyModal = (
      <ConfirmModal
        title="Delete Media"
        onCancel={closeDestroyModal}
        onConfirm={closeDestroyModal}
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        buttonColor="danger"
        defaultFocusedButton="confirm"
      >
        <p>Are you sure you want to delete this media?</p>
      </ConfirmModal>
    )
  }

  let modal

  if (isModalVisible) {
    modal = (
      <ModalWrapper onClose={closeModal}>
        <EuiFilePicker
          multiple
          initialPromptText="Select or drag and drop a file"
        />
        <ModalContentWrapper>
          <EuiText>Uploaded file</EuiText>
          <EuiButtonIcon
            iconType="trash"
            color="danger"
            onClick={showDestroyModal}
          />
        </ModalContentWrapper>
        {destroyModal}
      </ModalWrapper>
    )
  }

  let flyout

  if (isFlyoutVisible) {
    flyout = (
      <AssetFlyout
        ownFocus={false}
        outsideClickCloses
        size="s"
        onClose={() => setIsFlyoutVisible(false)}
        aria-labelledby={simpleFlyoutTitleId}
      >
        <EuiFlyoutHeader hasBorder>
          <AssetFlyoutImage src={active?.path}></AssetFlyoutImage>
          <FlyoutHeaderWrapper>
            <EuiTitle size="xs">
              <h3>Information</h3>
            </EuiTitle>
            <EuiIcon size="s" type="arrowDown" />
          </FlyoutHeaderWrapper>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <FlyoutBodyContent>
            <EuiTitle size="xs">
              <h3>Title</h3>
            </EuiTitle>
            <EuiText>{active?.file}</EuiText>
          </FlyoutBodyContent>

          <FlyoutBodyContent>
            <EuiTitle size="xs">
              <h3>Uploaded on</h3>
            </EuiTitle>
            <EuiText>
              {moment(active?.createdAt).toDate().toDateString()}
            </EuiText>
          </FlyoutBodyContent>

          <FlyoutBodyContent>
            <EuiTitle size="xs">
              <h3>Status</h3>
            </EuiTitle>
            <EuiText>Draft</EuiText>
          </FlyoutBodyContent>

          <FlyoutBodyContent>
            <EuiTitle size="xs">
              <h3>Created by</h3>
            </EuiTitle>
            <EuiText>{active?.name}</EuiText>
          </FlyoutBodyContent>

          <FlyoutBodyContent>
            <EuiTitle size="xs">
              <h3>Size</h3>
            </EuiTitle>
            <EuiText>{active && (active.size / 1000).toFixed(1)}MB</EuiText>
          </FlyoutBodyContent>

          <FlyoutBodyContent>
            <EuiTitle size="xs">
              <h3>Dimension</h3>
            </EuiTitle>
            <EuiText>
              {active?.width} x {active?.height}
            </EuiText>
          </FlyoutBodyContent>

          <FlyoutBodyContent>
            <EuiTitle size="xs">
              <h3>Format</h3>
            </EuiTitle>
            <EuiText>{active?.extension}</EuiText>
          </FlyoutBodyContent>
        </EuiFlyoutBody>
      </AssetFlyout>
    )
  }

  return (
    <>
      <DashboardLayout.Topbar>
        <EuiTitle size="xs">
          <h3>Asset Manager</h3>
        </EuiTitle>
        <EuiButton iconType="sortUp" fill onClick={showModal}>
          Upload media
        </EuiButton>
        {modal}
      </DashboardLayout.Topbar>

      <DashboardLayout.Content>
        <PageWrapper>
          <SearchAndFilterContainer>
            <EuiFieldSearch placeholder="Search Library" />

            <AssetPopover
              button={
                <EuiButtonEmpty iconSide="right" iconType="arrowDown">
                  Filters
                </EuiButtonEmpty>
              }
            >
              <EuiContextMenu initialPanelId={0}></EuiContextMenu>
            </AssetPopover>
          </SearchAndFilterContainer>
          {flyout}
          <AssetContainer>
            <EuiFlexGrid columns={4} gutterSize="m">
              {assets.map((asset: assetData) => {
                const cardFooterContent = (
                  <EuiFlexGroup justifyContent="flexStart" key={asset.altText}>
                    <EuiFlexItem grow={false}>
                      <EuiText>{(asset.size / 1000).toFixed(1)}MB</EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText>{asset.extension}</EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                )

                return (
                  <EuiFlexItem>
                    <EuiCard
                      onClick={() => {
                        setIsFlyoutVisible(true)
                        setActive(asset)
                      }}
                      textAlign="left"
                      hasBorder
                      image={asset.path}
                      title={asset.file}
                      description={asset.altText}
                      footer={cardFooterContent}
                    />
                  </EuiFlexItem>
                )
              })}
            </EuiFlexGrid>
          </AssetContainer>

          <NumberFieldAndPagination>
            <NumberFieldWrapper>
              <FieldNumber placeholder="10" />
            </NumberFieldWrapper>

            <PaginationWrapper>
              <EuiPagination
                pageCount={pageCount}
                activePage={activePage}
                onPageClick={activePage => setActivePage(activePage)}
              />
            </PaginationWrapper>
          </NumberFieldAndPagination>
        </PageWrapper>
      </DashboardLayout.Content>
    </>
  )
}
