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
import { EuiFlexItem, EuiFlexGroup } from '@tensei/eui/lib/components/flex'
import { EuiPagination } from '@tensei/eui/lib/components/pagination'
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlyoutFooter
} from '@tensei/eui/lib/components/flyout'
import { EuiModal } from '@tensei/eui/lib/components/modal/modal'
import { EuiConfirmModal } from '@tensei/eui/lib/components/modal/confirm_modal'
import { EuiCard } from '@tensei/eui/lib/components/card'
import moment from 'moment'

import { useGeneratedHtmlId } from '@tensei/eui/lib/services/accessibility'
import { EuiLoadingSpinner } from '@tensei/eui/lib/components/loading'
import { debounce } from 'throttle-debounce'
import { EuiProgress } from '@tensei/eui/lib/components/progress/progress'
import { useToastStore } from '../../../store/toast'
import {
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiTextArea
} from '@tensei/eui/lib/components/form'
import { useForm } from '../../hooks/forms'
import { EuiSpacer } from '@tensei/eui/lib'

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
const AssetCardWrapper = styled.div`
  position: relative;
  // padding: 15px;
`
const AssetWrapper = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
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
const EditHeading = styled.h2`
  font-size: 30px;
`

const ModalWrapper = styled(EuiModal)`
  padding: 35px 30px;
  margin-bottom: 0;
  width: 470px;
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
  div.__upload_progress {
    width: 100px;
    display: flex;
    align-items: center;
    span {
      margin-left: 3px;
    }
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
const EditIconWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  svg {
    margin-left: 8px;
  }
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
  id: number
  icon: false | true
}

interface AssetProps {
  onClick: () => void
  asset: AssetData
  setActive: (arg: AssetData) => void
  setShowEditForm: (arg: boolean) => void
  setIsFlyoutVisible: (arg: boolean) => void
  selectedItemsForDelete: selectedItems
  setSelectedItemsForDelete: (arg: selectedItems) => void
  setIsDeleteModalVisible: (arg: boolean) => void
}

type AssetArray = Array<AssetData>

const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
const formatImageSize = (x: any) => {
  let l = 0,
    n = parseInt(x, 10) || 0

  while (n >= 1024 && ++l) {
    n = n / 1024
  }

  return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]
}

const Assets: React.FC<AssetProps> = ({
  asset,
  setActive,
  setShowEditForm,
  setIsFlyoutVisible,
  selectedItemsForDelete,
  setSelectedItemsForDelete,
  setIsDeleteModalVisible
}) => {
  const [hovered, setHovered] = useState(false)
  const cardFooterContent = (
    <FooterTextWrapper>
      <EuiText>{formatImageSize(asset.size)}</EuiText>

      <EuiText>{asset.extension}</EuiText>
    </FooterTextWrapper>
  )

  return (
    <AssetCardWrapper
      onMouseLeave={() => {
        setHovered(false)
      }}
      onMouseEnter={() => {
        setHovered(true)
      }}
    >
      <EuiFlexItem>
        {hovered && (
          <EditIconWrapper>
            <EuiIcon
              size="m"
              type="pencil"
              color="green"
              onClick={() => {
                setShowEditForm(true)
                setIsFlyoutVisible(true)
                setActive(asset)
              }}
            />

            <EuiIcon
              size="m"
              type="trash"
              color="red"
              onClick={() => {
                setSelectedItemsForDelete([...selectedItemsForDelete, asset.id])
                setIsDeleteModalVisible(true)
              }}
            />
          </EditIconWrapper>
        )}
        <EuiCard
          onClick={() => {
            setIsFlyoutVisible(true)
            setActive(asset)
          }}
          textAlign="left"
          image={asset.path}
          title={asset.file}
          description=""
          footer={cardFooterContent}
        />
      </EuiFlexItem>
    </AssetCardWrapper>
  )
}

type selectedItems = number[]
export const AssetManager: FunctionComponent = () => {
  const [isDestroyMediaModalVisible, setIsDestroyModalVisible] = useState(false)
  const [isUploadMediaModalVisible, setIsUploadMediaModalVisible] =
    useState(false)
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false)

  const closeDestroyModal = () => setIsDestroyModalVisible(false)
  const showDestroyModal = () => setIsDestroyModalVisible(true)

  const [assets, setAssets] = useState<AssetArray>([])
  const [active, setActive] = useState<AssetData>()

  const [activePage, setActivePage] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [perPage, setPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setsearch] = useState('')
  const [selectedItemsForDelete, setSelectedItemsForDelete] =
    useState<selectedItems>([])
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const fetchFiles = async () => {
    const params = {
      page: activePage + 1,
      perPage,
      ...(search && { search })
    }
    const [response, error] = await window.Tensei.api.get('files', { params })
    if (!error) {
      setIsLoading(false)
      setAssets(response?.data.data)
      setPageCount(response?.data.meta.pageCount)
      return
    }
    setIsLoading(false)
  }
  useEffect(() => {
    setIsLoading(true)
    fetchFiles()
  }, [activePage, perPage, search])

  const closeUploadMediaModal = () => {
    if (isUploadingFiles) return
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
  const [selectedFilesUploadProgress, setSelectedFilesUploadProgress] =
    useState<{ progress: number; status: boolean }[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false)
  const { toast } = useToastStore()
  const [showEditForm, setShowEditForm] = useState(false)
  let destroyUploadedMediaModal

  if (isDestroyMediaModalVisible) {
    destroyUploadedMediaModal = (
      <ConfirmModal
        title="Delete Media"
        onCancel={closeDestroyModal}
        onConfirm={() => {
          selectedFiles.splice(selectedFileIndex!, 1)
          setSelectedFiles([...selectedFiles])
          setSelectedFilesUploadProgress(
            Array(selectedFiles.length).fill({ progress: 0, status: true })
          )
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

  const uploadMediaFiles = async () => {
    setIsUploadingFiles(true)

    Promise.all(
      selectedFiles.map(async (file, index) => {
        const formData = new FormData()
        formData.append('files', file)

        return window.axios
          .post('/files/upload', formData, {
            xsrfCookieName: 'x-csrf-token',
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: progressEvent => {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              )
              selectedFilesUploadProgress.splice(index, 1, {
                ...selectedFilesUploadProgress[index],
                progress: progress
              })
              setSelectedFilesUploadProgress([...selectedFilesUploadProgress])
            }
          })
          .then(_ => {
            return true
          })
          .catch(error => {
            selectedFilesUploadProgress.splice(index, 1, {
              ...selectedFilesUploadProgress[index],
              status: false
            })
            setSelectedFilesUploadProgress([...selectedFilesUploadProgress])
            return false
          })
      })
    )
      .then(response => {
        const total = response.length
        const success = response.filter(upload => upload === true).length
        const error = total - success

        if (error === 0) {
          setIsUploadingFiles(false)
          closeUploadMediaModal()
          toast('Success', `Uploaded ${success} of ${total} media files.`)
        } else {
          response.forEach((upload, index) => {
            if (upload === true) {
              selectedFiles.splice(index, 1)
              setSelectedFiles([...selectedFiles])
            }
          })
          setSelectedFilesUploadProgress(
            Array(error).fill({ progress: 0, status: true })
          )

          setIsUploadingFiles(false)
          toast(
            'Error',
            `${error} media files failed to upload out of ${total}.`,
            'danger'
          )
        }
      })
      .catch(_ => {
        setSelectedFilesUploadProgress(
          Array(selectedFiles.length).fill({ progress: 0, status: true })
        )
        setIsUploadingFiles(false)
        toast('Error', `Error uploading media files.`, 'danger')
      })
  }

  let uploadMediaModal

  if (isUploadMediaModalVisible) {
    uploadMediaModal = (
      <ModalWrapper maxWidth={false} onClose={closeUploadMediaModal}>
        <EuiFilePicker
          id={filePickerId}
          multiple
          fullWidth
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
            if (files.length > 0) {
              setSelectedFiles([...selectedFiles, ...Array.from(files)])
              setSelectedFilesUploadProgress(
                Array(files.length).fill({ progress: 0, status: true })
              )
            }
          }}
        />
        {selectedFiles.length > 0 && (
          <SelectedFilesWrapper>
            {selectedFiles.map((file, index) => (
              <div key={index}>
                <SelectedFileWrapper>
                  <SelectedFileContent>
                    <EuiIcon type={getIconType(file.type)} />
                    <div className="__filename">{file.name}</div>
                  </SelectedFileContent>
                  <SelectedFileContent>
                    {isUploadingFiles ? (
                      <div className="__upload_progress">
                        <EuiProgress
                          color={
                            selectedFilesUploadProgress[index]?.status === true
                              ? 'success'
                              : 'danger'
                          }
                          value={selectedFilesUploadProgress[index]?.progress}
                          max={100}
                          size="m"
                        />
                        <span>
                          {selectedFilesUploadProgress[index].progress}%
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="__filesize">
                          {parseInt((file.size / 1024).toString())}kb
                        </div>
                        <EuiButtonIcon
                          iconType="cross"
                          color="text"
                          disabled={isUploadingFiles}
                          onClick={() => {
                            setSelectedFileIndex(index)
                            showDestroyModal()
                          }}
                        />
                      </>
                    )}
                  </SelectedFileContent>
                </SelectedFileWrapper>
              </div>
            ))}
          </SelectedFilesWrapper>
        )}
        {selectedFiles.length > 0 && (
          <SelectedFilesActionWrapper>
            <EuiButtonEmpty
              color="danger"
              disabled={isUploadingFiles}
              onClick={closeUploadMediaModal}
            >
              Cancel
            </EuiButtonEmpty>
            <EuiButton
              type="submit"
              iconType="sortUp"
              fill
              isLoading={isUploadingFiles}
              onClick={uploadMediaFiles}
            >
              Upload media to the library
            </EuiButton>
          </SelectedFilesActionWrapper>
        )}
        {destroyUploadedMediaModal}
      </ModalWrapper>
    )
  }

  interface EditInput {
    name: string
    description: string
    size?: number
  }

  const editAsset = (input: EditInput) =>
    window.Tensei.api.patch(`files/${active?.id}`, {
      ...input,
      size: active?.size
    })

  const deleteAsset = async (ids: number[]) => {
    const [_response, err] = await window.Tensei.api.delete(`files/`, {
      params: { where: { id: { _in: ids } } }
    })
    fetchFiles()
    if (!err) {
      toast('Deleted', `You've succesfully deleted the asset`)
    }
  }

  const { form, errors, submit, loading, setValue } = useForm<EditInput>({
    defaultValues: {
      name: '',
      description: ''
    },
    onSubmit: editAsset,
    onSuccess: () => {
      setIsFlyoutVisible(false)
      toast('Updated', `You've successfully updated the asset.`)
      fetchFiles()
    }
  })

  let flyout

  if (isFlyoutVisible) {
    flyout = (
      <AssetFlyout
        ownFocus={false}
        outsideClickCloses
        size="s"
        onClose={() => {
          setIsFlyoutVisible(false)
          setShowEditForm(false)
        }}
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
          {!showEditForm && (
            <>
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
            </>
          )}

          <EuiSpacer size="m" />
          {showEditForm && (
            <EuiForm component="form" onSubmit={submit}>
              <EditHeading>Edit Asset</EditHeading>
              <EuiSpacer size="l" />
              <EuiFormRow
                label="Filename"
                error={errors?.name}
                isInvalid={!!errors?.name}
              >
                <EuiFieldText
                  fullWidth
                  value={form.name}
                  isInvalid={!!errors?.name}
                  onChange={event => {
                    setValue('name', event.target.value)
                  }}
                />
              </EuiFormRow>

              <EuiFormRow label="Description">
                <EuiTextArea
                  fullWidth
                  value={form.description}
                  onChange={event => {
                    setValue('description', event.target.value)
                  }}
                />
              </EuiFormRow>
            </EuiForm>
          )}
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                iconType="cross"
                onClick={() => setIsFlyoutVisible(false)}
              >
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                type="submit"
                isLoading={loading}
                onClick={() => submit()}
                fill
              >
                Submit
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
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

  const items = [10, 20, 50].map(item => {
    return (
      <EuiContextMenuItem
        key={`${item} rows`}
        onClick={() => {
          setPerPage(item)
          setIsPopoverOpen(false)
        }}
      >
        {item} assets
      </EuiContextMenuItem>
    )
  })

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
          {isLoading ? (
            <LoadingContainer>
              &nbsp;&nbsp;
              <EuiLoadingSpinner size="xl" />
            </LoadingContainer>
          ) : (
            <AssetContainer>
              <AssetWrapper>
                {assets.map((asset, idx: number) => (
                  <Assets
                    key={idx}
                    onClick={() => {
                      setIsFlyoutVisible(true)
                      setActive(asset)
                    }}
                    asset={asset}
                    setActive={setActive}
                    setShowEditForm={setShowEditForm}
                    setIsFlyoutVisible={setIsFlyoutVisible}
                    selectedItemsForDelete={selectedItemsForDelete}
                    setSelectedItemsForDelete={setSelectedItemsForDelete}
                    setIsDeleteModalVisible={setIsDeleteModalVisible}
                  />
                ))}
              </AssetWrapper>
              {isDeleteModalVisible && (
                <EuiConfirmModal
                  title="Are you sure you want to delete this asset?"
                  onCancel={() => {
                    setIsDeleteModalVisible(false)
                    setSelectedItemsForDelete([])
                  }}
                  onConfirm={() => {
                    deleteAsset(selectedItemsForDelete)
                    setSelectedItemsForDelete([])
                    setIsDeleteModalVisible(false)
                  }}
                  cancelButtonText="Cancel"
                  confirmButtonText="Delete"
                  buttonColor="danger"
                ></EuiConfirmModal>
              )}
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
