import React, { FunctionComponent, useState } from 'react'
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

import { useGeneratedHtmlId } from '@tensei/eui/lib/services/accessibility'
import { EuiProgress } from '@tensei/eui/lib/components/progress/progress'
import { useRef } from 'react'
import { useToastStore } from '../../../store/toast'

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

export const AssetManager: FunctionComponent = () => {
  const [isDestroyMediaModalVisible, setIsDestroyModalVisible] = useState(false)
  const [isUploadMediaModalVisible, setIsUploadMediaModalVisible] = useState(false)
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false)

  const closeDestroyModal = () => setIsDestroyModalVisible(false)
  const showDestroyModal = () => setIsDestroyModalVisible(true)

  const closeUploadMediaModal = () => {
    if (isUploadingFiles) return;
    setSelectedFiles([])
    setIsUploadMediaModalVisible(false)
  }
  const showUploadMediaModal = () => setIsUploadMediaModalVisible(true)

  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: 'simpleFlyoutTitle'
  })

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const filePickerId = useGeneratedHtmlId({ prefix: 'filePicker' });
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>()
  const [selectedFilesUploadProgress, setSelectedFilesUploadProgress] = useState<{ progress: number, status: boolean }[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false)
  const { toast } = useToastStore()

  let destroyUploadedMediaModal

  if (isDestroyMediaModalVisible) {
    destroyUploadedMediaModal = (
      <ConfirmModal
        title="Delete Media"
        onCancel={closeDestroyModal}
        onConfirm={() => {
          selectedFiles.splice(selectedFileIndex!, 1);
          setSelectedFiles([...selectedFiles])
          setSelectedFilesUploadProgress(Array(selectedFiles.length).fill({ progress: 0, status: true }))
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
    if (/image\//gi.exec(type) !== null) return 'image';
    else return 'document';
  };

  let uploadMediaModal

  if (isUploadMediaModalVisible) {
    uploadMediaModal = (
      <ModalWrapper onClose={closeUploadMediaModal}>
        <EuiFilePicker
          id={filePickerId}
          multiple
          initialPromptText={(
            <InitialPromptTextWrapper>
              <p>Drag and drop files, or browse</p>
              <small>Max 1MB each. Supported format JPG, GIF, PNG, PDF</small>
            </InitialPromptTextWrapper>
          )}
          accept='*/*'
          isLoading={false}
          isInvalid={false}
          onChange={(files: FileList) => {
            if (files.length > 0) {
              setSelectedFiles([...selectedFiles, ...Array.from(files)])
              setSelectedFilesUploadProgress(Array(files.length).fill({ progress: 0, status: true }))
            }
          }}
        />
        {
          selectedFiles.length > 0 &&
          <SelectedFilesWrapper>
            {
              selectedFiles.map((file, index) => (
                <div key={index}>
                  <SelectedFileWrapper>
                    <SelectedFileContent>
                      <EuiIcon type={getIconType(file.type)} />
                      <div className='__filename'>{file.name}</div>
                    </SelectedFileContent>
                    <SelectedFileContent>
                      {
                        isUploadingFiles ?
                          <div className='__upload_progress'>
                            <EuiProgress
                              color={selectedFilesUploadProgress[index].status === true ? 'success' : 'danger'}
                              value={selectedFilesUploadProgress[index].progress}
                              max={100} size="m"
                            />
                            <span>{selectedFilesUploadProgress[index].progress}%</span>
                          </div>
                          : <>
                            <div className='__filesize'>{parseInt((file.size / 1024).toString())}kb</div>
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
                      }
                    </SelectedFileContent>
                  </SelectedFileWrapper>
                </div>
              ))
            }
          </SelectedFilesWrapper>
        }
        {
          selectedFiles.length > 0 && (
            <SelectedFilesActionWrapper>
              <EuiButtonEmpty color='danger' disabled={isUploadingFiles} onClick={closeUploadMediaModal}>Cancel</EuiButtonEmpty>
              <EuiButton type='submit' iconType="sortUp" fill isLoading={isUploadingFiles}
                onClick={async () => {

                  setIsUploadingFiles(true)

                  await Promise.all(
                    selectedFiles.map(async (file, index) => {
                      const formData = new FormData();
                      formData.append("files", file)

                      return window.axios.post('/files/upload', formData, {
                        xsrfCookieName: 'x-csrf-token',
                        headers: { "Content-Type": "multipart/form-data" },
                        onUploadProgress: (progressEvent) => {
                          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
                          selectedFilesUploadProgress.splice(index, 1, { ...selectedFilesUploadProgress[index], progress: progress });
                          setSelectedFilesUploadProgress([...selectedFilesUploadProgress])
                        }
                      })
                        .then(_ => {
                          return true;
                        })
                        .catch(error => {
                          selectedFilesUploadProgress.splice(index, 1, { ...selectedFilesUploadProgress[index], status: false });
                          setSelectedFilesUploadProgress([...selectedFilesUploadProgress])
                          return false;
                        })
                    })
                  )
                    .then(response => {
                      const total = response.length
                      const success = response.filter(upload => upload === true).length
                      const error = total - success

                      if (error === 0) {
                        setIsUploadingFiles(false)
                        closeUploadMediaModal();
                        toast('Success', `Uploaded ${success} of ${total} media files.`)
                      } else {

                        response.forEach((upload, index) => {
                          if (upload === true) {
                            selectedFiles.splice(index, 1)
                            setSelectedFiles([...selectedFiles])
                          }
                        })
                        setSelectedFilesUploadProgress(Array(error).fill({ progress: 0, status: true }))

                        setIsUploadingFiles(false)
                        toast('Error', `${error} media files failed to upload out of ${total}.`, 'danger')
                      }
                    })
                    .catch(_ => {
                      setSelectedFilesUploadProgress(Array(selectedFiles.length).fill({ progress: 0, status: true }))
                      setIsUploadingFiles(false)
                      toast('Error', `Error uploading media files.`, 'danger')
                    })
                }}
              >Upload media to the library</EuiButton>
            </SelectedFilesActionWrapper>
          )
        }
        {destroyUploadedMediaModal}
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
          <AssetFlyoutImage
            src={
              'https://images.unsplash.com/photo-1617043593449-c881f876a4b4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHNtYXJ0JTIwd2F0Y2h8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
            }
          ></AssetFlyoutImage>
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
            <EuiText>Smart_watch</EuiText>
          </FlyoutBodyContent>

          <FlyoutBodyContent>
            <EuiTitle size="xs">
              <h3>Uploaded on</h3>
            </EuiTitle>
            <EuiText>2 hours ago</EuiText>
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
            <EuiText>John Doe</EuiText>
          </FlyoutBodyContent>

          <FlyoutBodyContent>
            <EuiTitle size="xs">
              <h3>Size</h3>
            </EuiTitle>
            <EuiText>2.3MB</EuiText>
          </FlyoutBodyContent>

          <FlyoutBodyContent>
            <EuiTitle size="xs">
              <h3>Dimension</h3>
            </EuiTitle>
            <EuiText>235 x 300</EuiText>
          </FlyoutBodyContent>

          <FlyoutBodyContent>
            <EuiTitle size="xs">
              <h3>Format</h3>
            </EuiTitle>
            <EuiText>PNG</EuiText>
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
        <EuiButton iconType="sortUp" fill onClick={showUploadMediaModal}>
          Upload media
        </EuiButton>
        {uploadMediaModal}
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

          <AssetContainer>
            <EuiFlexGrid columns={4} gutterSize="m">
              <EuiFlexItem>
                <EuiCard
                  textAlign="left"
                  hasBorder
                  image="https://source.unsplash.com/400x200/?Water"
                  title="Elastic in Water"
                  description="Example of a card's description. Stick to one or two sentences."
                // footer={cardFooterContent}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCard
                  textAlign="left"
                  hasBorder
                  image="https://source.unsplash.com/400x200/?Water"
                  title="Elastic in Water"
                  description="Example of a card's description. Stick to one or two sentences."
                // footer={cardFooterContent}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCard
                  textAlign="left"
                  hasBorder
                  image="https://source.unsplash.com/400x200/?Water"
                  title="Elastic in Water"
                  description="Example of a card's description. Stick to one or two sentences."
                // footer={cardFooterContent}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCard
                  textAlign="left"
                  hasBorder
                  image="https://source.unsplash.com/400x200/?Water"
                  title="Elastic in Water"
                  description="Example of a card's description. Stick to one or two sentences."
                // footer={cardFooterContent}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCard
                  textAlign="left"
                  hasBorder
                  image="https://source.unsplash.com/400x200/?Water"
                  title="Elastic in Water"
                  description="Example of a card's description. Stick to one or two sentences."
                // footer={cardFooterContent}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCard
                  textAlign="left"
                  hasBorder
                  image="https://source.unsplash.com/400x200/?Water"
                  title="Elastic in Water"
                  description="Example of a card's description. Stick to one or two sentences."
                // footer={cardFooterContent}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCard
                  textAlign="left"
                  hasBorder
                  image="https://source.unsplash.com/400x200/?Water"
                  title="Elastic in Water"
                  description="Example of a card's description. Stick to one or two sentences."
                // footer={cardFooterContent}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCard
                  textAlign="left"
                  hasBorder
                  image="https://source.unsplash.com/400x200/?Water"
                  title="Elastic in Water"
                  description="Example of a card's description. Stick to one or two sentences."
                // footer={cardFooterContent}
                />
              </EuiFlexItem>
            </EuiFlexGrid>
          </AssetContainer>

          <NumberFieldAndPagination>
            <NumberFieldWrapper>
              <FieldNumber placeholder="10" />
            </NumberFieldWrapper>

            <PaginationWrapper>
              <EuiPagination aria-label="Many pages example" />
            </PaginationWrapper>
          </NumberFieldAndPagination>
        </PageWrapper>
      </DashboardLayout.Content>
    </>
  )
}
