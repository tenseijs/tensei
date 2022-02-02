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
import {
  EuiContextMenu,
  EuiContextMenuItem,
  EuiContextMenuPanel
} from '@tensei/eui/lib/components/context_menu'
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
import { EuiLoadingSpinner } from '@tensei/eui/lib/components/loading'
import { debounce } from 'throttle-debounce'

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
  @media screen and (max-width: 950px) {
    width: 100%;
  }
`

const AssetPopover = styled(EuiPopover)`
  margin-left: 10px;
`

const AssetContainer = styled.div`
  max-width: 100%;
  padding: 25px 0;
`

const AssetWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 1.5rem;
  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
  @media screen and (max-width: 650px) {
    grid-template-columns: 1fr 1fr;
  }
  @media screen and (max-width: 550px) {
    grid-template-columns: 1fr;
  }
`
const FooterTextWrapper = styled.div`
  display: flex;
  align-item: flex-start;
  div {
    margin-right: 15px;
  }
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
  padding: 35px 30px;
  margin-bottom: 0;
`
const ConfirmModal = styled(EuiConfirmModal)`
  width: 400px;
  height: 230px;
`
const InitialPromptTextWrapper = styled.div`
  text-align: center;
`
const SelectedFilesWrapper = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
`
const SelectedFileWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid grey;
  padding: 5px 0px;
  margin-bottom: 10px;
`
const SelectedFileContent = styled.div`
  display: flex;
  align-items: center;
  div.__filename {
    margin: 0px 5px;
    max-width: 200px;
    overflow: clip;
    text-overflow: ellipsis;
    line-break: anywhere;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  div.__filesize {
    margin: 0px 3px;
  }
`
const SelectedFilesActionWrapper = styled.div`
  display: flex;
  justify-content: end;
  button {
    margin-left: 10px;
  }
`
const LoadingContainer = styled.div`
  width: 20%;
  margin 15% auto;
`

interface AssetData {
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
  const [isDestroyMediaModalVisible, setIsDestroyModalVisible] = useState(false)
  const [isUploadMediaModalVisible, setIsUploadMediaModalVisible] =
    useState(false)
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false)

  const closeDestroyModal = () => setIsDestroyModalVisible(false)
  const showDestroyModal = () => setIsDestroyModalVisible(true)

  const [assets, setAssets] = useState([])
  const [active, setActive] = useState<AssetData>()

  const [activePage, setActivePage] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [perPage, setPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [search, setsearch] = useState('')

  useEffect(() => {
    setLoading(true)
    const fetchFiles = async () => {
      const params = {
        page: activePage + 1,
        perPage,
        ...(search && { search })
      }
      const [data, error] = await window.Tensei.api.get('files', { params })
      if (!error) {
        setLoading(false)
        setAssets(data?.data.data)
        setPageCount(data?.data.meta.pageCount)
        return
      }
      setLoading(false)
    }
    fetchFiles()
  }, [activePage, perPage, search])

  const closeUploadMediaModal = () => {
    setSelectedFiles([])
    setIsUploadMediaModalVisible(false)
  }
  const showUploadMediaModal = () => setIsUploadMediaModalVisible(true)

  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: 'simpleFlyoutTitle'
  })

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const filePickerId = useGeneratedHtmlId({ prefix: 'filePicker' })
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>()

  let destroyUploadedMediaModal

  if (isDestroyMediaModalVisible) {
    destroyUploadedMediaModal = (
      <ConfirmModal
        title="Delete Media"
        onCancel={closeDestroyModal}
        onConfirm={() => {
          selectedFiles.splice(selectedFileIndex!, 1)
          closeDestroyModal()
        }}
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        buttonColor="danger"
        defaultFocusedButton="confirm"
      >
        <p>Are you sure you want to delete this media?</p>
      </ConfirmModal>
    )
  }

  const getIconType = (type: string) => {
    if (/image\//gi.exec(type) !== null) return 'image'
    else return 'document'
  }

  let uploadMediaModal

  if (isUploadMediaModalVisible) {
    uploadMediaModal = (
      <ModalWrapper onClose={closeUploadMediaModal}>
        <EuiFilePicker
          id={filePickerId}
          multiple
          initialPromptText={
            <InitialPromptTextWrapper>
              <p>Drag and drop files, or browse</p>
              <small>Max 1MB each. Supported format JPG, GIF, PNG, PDF</small>
            </InitialPromptTextWrapper>
          }
          accept="*/*"
          isLoading={false}
          isInvalid={false}
          onSubmit={() => {}}
          onChange={(files: FileList) => {
            files.length > 0 &&
              setSelectedFiles([...selectedFiles, ...Array.from(files)])
          }}
        />
        {selectedFiles.length > 0 && (
          <SelectedFilesWrapper>
            {selectedFiles.map((file, index) => (
              <SelectedFileWrapper>
                <SelectedFileContent>
                  <EuiIcon type={getIconType(file.type)} />
                  <div className="__filename">{file.name}</div>
                </SelectedFileContent>
                <SelectedFileContent>
                  <div className="__filesize">
                    {parseInt((file.size / 1024).toString())}kb
                  </div>
                  <EuiButtonIcon
                    iconType="cross"
                    color="text"
                    onClick={() => {
                      setSelectedFileIndex(index)
                      showDestroyModal()
                    }}
                  />
                </SelectedFileContent>
              </SelectedFileWrapper>
            ))}
          </SelectedFilesWrapper>
        )}
        {selectedFiles.length > 0 && (
          <SelectedFilesActionWrapper>
            <EuiButtonEmpty color="danger" onClick={closeUploadMediaModal}>
              Cancel
            </EuiButtonEmpty>
            <EuiButton iconType="sortUp" fill>
              Upload media to the library
            </EuiButton>
          </SelectedFilesActionWrapper>
        )}
        {destroyUploadedMediaModal}
      </ModalWrapper>
    )
  }
  const formatImageSize = (size: number) => `${(size / 1000).toFixed(1)}MB`
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
            <EuiText>{active && formatImageSize(active.size)}</EuiText>
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
  const button = (
    <EuiButtonEmpty
      size="xs"
      color="text"
      iconType="arrowDown"
      iconSide="right"
      onClick={() => setIsPopoverOpen(!isPopoverOpen)}
    >
      Assets per page: {perPage}
    </EuiButtonEmpty>
  )

  const items = [
    <EuiContextMenuItem
      key="10 rows"
      onClick={() => {
        setPerPage(10)
        setIsPopoverOpen(false)
      }}
    >
      10 assets
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="20 rows"
      onClick={() => {
        setPerPage(20)
        setIsPopoverOpen(false)
      }}
    >
      20 assets
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="50 rows"
      onClick={() => {
        setPerPage(50)
        setIsPopoverOpen(false)
      }}
    >
      50 assets
    </EuiContextMenuItem>
  ]

  const onSearchChange = debounce(500, false, (value: string) => {
    setsearch(value)
  })

  return (
    <>
      <DashboardLayout.Topbar>
        <EuiTitle size="xs">
          <h3>Asset Manager</h3>
        </EuiTitle>
        <EuiButton iconType="sortUp" fill onClick={showUploadMediaModal}>
          Upload media
        </EuiButton>
        {uploadMediaModal}
      </DashboardLayout.Topbar>

      <DashboardLayout.Content>
        <PageWrapper>
          <SearchAndFilterContainer>
            <EuiFieldSearch
              placeholder="Search Library"
              onChange={event => {
                onSearchChange(event.target.value)
              }}
            />

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
          {loading ? (
            <LoadingContainer>
              &nbsp;&nbsp;
              <EuiLoadingSpinner size="xl" />
            </LoadingContainer>
          ) : (
            <AssetContainer>
              <AssetWrapper>
                {assets.map((asset: AssetData) => {
                  const cardFooterContent = (
                    <FooterTextWrapper>
                      <EuiText>{formatImageSize(asset.size)}</EuiText>

                      <EuiText>{asset.extension}</EuiText>
                    </FooterTextWrapper>
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
                        description=""
                        footer={cardFooterContent}
                      />
                    </EuiFlexItem>
                  )
                })}
              </AssetWrapper>
            </AssetContainer>
          )}
          <NumberFieldAndPagination>
            <EuiPopover
              button={button}
              isOpen={isPopoverOpen}
              closePopover={() => setIsPopoverOpen(false)}
              panelPaddingSize="none"
            >
              <EuiContextMenuPanel items={items} />
            </EuiPopover>

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
