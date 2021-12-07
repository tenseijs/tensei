import React, { FunctionComponent, useState } from 'react'
import styled from 'styled-components'

import { DashboardLayout } from '../../components/dashboard/layout'

import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiButtonEmpty, EuiButton, EuiButtonIcon } from '@tensei/eui/lib/components/button'
import { EuiFieldSearch } from '@tensei/eui/lib/components/form/field_search'
import { EuiPopover } from '@tensei/eui/lib/components/popover'
import { EuiContextMenu } from '@tensei/eui/lib/components/context_menu'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { EuiFilePicker } from '@tensei/eui/lib/components/form'
import { EuiModal } from '@tensei/eui/lib/components/modal/modal'
import { EuiConfirmModal } from '@tensei/eui/lib/components/modal/confirm_modal'

const PageWrapper = styled.div`
  width: 100%;
  padding: 40px;
  margin-bottom: 30px;
`

const SearchAndFilterContainer = styled.div`
  display: flex;
  width: 50%;
  align-items: center;
  justify-content: space-space-between;
`

const AssetPopover = styled(EuiPopover)`
    margin-left: 10px;
`

const NoAssetWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const AssetImage = styled.img`
    margin-top: 1.75rem;
`
const NoAssetTitle = styled(EuiTitle)`
    margin-top: -45px;
`

const NoAssetText = styled(EuiText)`
    padding: 0 360px;
    text-align: center;
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


export const NoAsset: FunctionComponent  = () => {

  const [isDestroyModalVisible, setIsDestroyModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false)

  const closeDestroyModal = () => setIsDestroyModalVisible(false);
  const showDestroyModal = () => setIsDestroyModalVisible(true);

  const closeModal = () => setIsModalVisible(false)
  const showModal = () => setIsModalVisible(true)


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
          {destroyModal}
        </ModalContentWrapper>
      </ModalWrapper>
    )
  }

    return (
        <DashboardLayout>
           <DashboardLayout.Sidebar title="Content"></DashboardLayout.Sidebar>

            <DashboardLayout.Body>
                <DashboardLayout.Topbar>
                    <EuiTitle size="xs">
                        <h3>Library</h3>
                    </EuiTitle>
                    <EuiButton iconType="plusInCircle" fill onClick={showModal}>
                        Upload media
                    </EuiButton>
                    {modal}
                </DashboardLayout.Topbar>
                <DashboardLayout.Content>
                    <PageWrapper>
                        <SearchAndFilterContainer>
                            <EuiFieldSearch
                                placeholder='Search Library'
                            />

                            <AssetPopover
                                button={
                                    <EuiButtonEmpty
                                        iconSide="right"
                                        iconType="arrowDown"
                                    >
                                        Filters
                                    </EuiButtonEmpty>
                                }
                            >
                                <EuiContextMenu initialPanelId={0}></EuiContextMenu>
                            </AssetPopover>
                        </SearchAndFilterContainer>
        
                        <NoAssetWrapper>
                            <AssetImage
                                width={400}
                                height={300}
                                src={
                                    'https://res.cloudinary.com/annysah/image/upload/v1638393799/drawing-2194233-0_qgaes0.png'
                                }
                            ></AssetImage>
                            <NoAssetTitle size="xs">
                                <h3>No assets uploaded</h3>
                            </NoAssetTitle>
                            <EuiSpacer size="s" />

                            <NoAssetText size="xs">
                                Oops! It looks like you haven’t uploaded any asset yet
                            </NoAssetText>

                        </NoAssetWrapper>
                       
                    </PageWrapper>
                    
                </DashboardLayout.Content>
            </DashboardLayout.Body>
        </DashboardLayout>
    )
}

