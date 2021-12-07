import React, { FunctionComponent, useState } from 'react'
import styled from 'styled-components'

import { DashboardLayout } from '../../components/dashboard/layout'

import { EuiFieldNumber } from '@tensei/eui/lib/components/form'
import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { EuiCard } from '@tensei/eui/lib/components/card'
import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiButtonEmpty, EuiButton, EuiButtonIcon } from '@tensei/eui/lib/components/button'
import { EuiFieldSearch } from '@tensei/eui/lib/components/form/field_search'
import { EuiPopover } from '@tensei/eui/lib/components/popover'
import { EuiContextMenu } from '@tensei/eui/lib/components/context_menu'
import { EuiFilePicker } from '@tensei/eui/lib/components/form'
import { EuiFlexItem, EuiFlexGroup } from '@tensei/eui/lib/components/flex'
import { EuiPagination } from '@tensei/eui/lib/components/pagination'
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader
} from '@tensei/eui/lib/components/flyout'
import { EuiModal } from '@tensei/eui/lib/components/modal/modal'
import { EuiConfirmModal } from '@tensei/eui/lib/components/modal/confirm_modal'

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

export const AssetManager: FunctionComponent = () => {
  const [isDestroyModalVisible, setIsDestroyModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false)

  const closeDestroyModal = () => setIsDestroyModalVisible(false);
  const showDestroyModal = () => setIsDestroyModalVisible(true);

  const closeModal = () => setIsModalVisible(false)
  const showModal = () => setIsModalVisible(true)

  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: 'simpleFlyoutTitle'
  })


  let destroyModal;

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
    );
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
          <EuiButtonIcon iconType="trash" color='danger' onClick={showDestroyModal} /> 
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
    <DashboardLayout>
      <DashboardLayout.Sidebar title="Content"></DashboardLayout.Sidebar>

      <DashboardLayout.Body>
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

            <AssetContainer>
              <AssetWrapper>
                <EuiFlexItem  onClick={() => setIsFlyoutVisible(true)}>
                  <AssetCard
                    image={
                      <AssetCardImage
                        height={120}
                        src="https://images.unsplash.com/photo-1617043593449-c881f876a4b4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHNtYXJ0JTIwd2F0Y2h8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60"
                      ></AssetCardImage>
                    }
                    title="Smart_watch"
                    titleSize="xs"
                    description="PNG 2.3MB"
                    textAlign="left"
                    footer={
                      <EuiFlexGroup justifyContent="flexEnd">
                        <EuiFlexItem grow={false}>
                          <EuiButtonIcon
                            iconType="eye"
                            onClick={() => setIsFlyoutVisible(true)}
                          />
                          {flyout}
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    }
                    paddingSize="s"
                  />
                </EuiFlexItem>
                <EuiFlexItem  onClick={() => setIsFlyoutVisible(true)}>
                  <AssetCard
                    image={
                      <AssetCardImage
                        height={120}
                        src="https://res.cloudinary.com/annysah/image/upload/v1638485798/file-unknow-line_1_zbfkfy.png"
                      ></AssetCardImage>
                    }
                    title="Jack_Robinson"
                    titleSize="xs"
                    description="TXT 2.3KB"
                    textAlign="left"
                    footer={
                      <EuiFlexGroup justifyContent="flexEnd">
                        <EuiFlexItem grow={false}>
                          <EuiButtonIcon
                            iconType="eye"
                            onClick={() => setIsFlyoutVisible(true)}
                          />
                          {flyout}
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    }
                    paddingSize="s"
                  />
                </EuiFlexItem>

                <EuiFlexItem  onClick={() => setIsFlyoutVisible(true)}>
                  <AssetCard
                    image={
                      <AssetCardImage
                        height={120}
                        src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTAzfHxsYXB0b3B8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60"
                      ></AssetCardImage>
                    }
                    title="Smart_watch"
                    titleSize="xs"
                    description="PNG 2.3MB"
                    textAlign="left"
                    footer={
                      <EuiFlexGroup justifyContent="flexEnd">
                        <EuiFlexItem grow={false}>
                          <EuiButtonIcon
                            iconType="eye"
                            onClick={() => setIsFlyoutVisible(true)}
                          />
                          {flyout}
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    }
                    paddingSize="s"
                  />
                </EuiFlexItem>
                <EuiFlexItem  onClick={() => setIsFlyoutVisible(true)}>
                  <AssetCard
                    image={
                      <AssetCardImage
                        height={120}
                        src="https://images.unsplash.com/photo-1617043593449-c881f876a4b4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHNtYXJ0JTIwd2F0Y2h8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60"
                      ></AssetCardImage>
                    }
                    title="Smart_watch"
                    titleSize="xs"
                    description="PNG 2.3MB"
                    textAlign="left"
                    footer={
                      <EuiFlexGroup justifyContent="flexEnd">
                        <EuiFlexItem grow={false}>
                          <EuiButtonIcon
                            iconType="eye"
                            onClick={() => setIsFlyoutVisible(true)}
                          />
                          {flyout}
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    }
                    paddingSize="s"
                  />
                </EuiFlexItem>

                <EuiFlexItem  onClick={() => setIsFlyoutVisible(true)}>
                  <AssetCard
                    image={
                      <AssetCardImage
                        height={120}
                        src="https://res.cloudinary.com/annysah/image/upload/v1638485798/file-unknow-line_1_zbfkfy.png"
                      ></AssetCardImage>
                    }
                    title="Jack_Robinson"
                    titleSize="xs"
                    description="TXT 2.3KB"
                    textAlign="left"
                    footer={
                      <EuiFlexGroup justifyContent="flexEnd">
                        <EuiFlexItem grow={false}>
                          <EuiButtonIcon
                            iconType="eye"
                            onClick={() => setIsFlyoutVisible(true)}
                          />
                          {flyout}
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    }
                    paddingSize="s"
                  />
                </EuiFlexItem>

                <EuiFlexItem  onClick={() => setIsFlyoutVisible(true)}>
                  <AssetCard
                    image={
                      <AssetCardImage
                        height={120}
                        src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fGxhcHRvcHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
                      ></AssetCardImage>
                    }
                    title="Macbook_Pro"
                    titleSize="xs"
                    description="PNG 2.6MB"
                    textAlign="left"
                    footer={
                      <EuiFlexGroup justifyContent="flexEnd">
                        <EuiFlexItem grow={false}>
                          <EuiButtonIcon
                            iconType="eye"
                            onClick={() => setIsFlyoutVisible(true)}
                          />
                          {flyout}
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    }
                    paddingSize="s"
                  />
                </EuiFlexItem>
              </AssetWrapper>
            </AssetContainer>

            <NumberFieldAndPagination>
              <NumberFieldWrapper>
                <FieldNumber
                  placeholder="10"
                />
              </NumberFieldWrapper>

              <PaginationWrapper>
                <EuiPagination aria-label="Many pages example" />
              </PaginationWrapper>
            </NumberFieldAndPagination>

          </PageWrapper>

        </DashboardLayout.Content>
      </DashboardLayout.Body>
    </DashboardLayout>
  )
}
