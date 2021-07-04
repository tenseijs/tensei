import Qs from 'qs'
import React, { useState } from 'react'

import {
  ConfirmModal,
  ResourceContract,
  AbstractData
} from '@tensei/components'

export interface DeleteModalProps {
  open: boolean
  leavesPage?: boolean
  onDelete?: () => void
  selected: AbstractData[]
  resource: ResourceContract
  setOpen: (open: boolean) => void
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  setOpen,
  resource,
  selected,
  onDelete,
  leavesPage
}) => {
  const [deleting, setDeleting] = useState<boolean>(false)
  const oneItem = selected.length === 1

  const getQuery = () => {
    return Qs.stringify(
      {
        where: {
          id: {
            _in: selected.map(item => item.id)
          }
        }
      },
      { encodeValuesOnly: true }
    )
  }

  const onConfirm = () => {
    setDeleting(true)

    window.Tensei.client
      .delete(`${resource.slug}/${oneItem ? selected[0].id : `?${getQuery()}`}`)
      .then(() => {
        window.Tensei.success(
          `${resource.name} with ID ${selected[0].id} was deleted.`
        )

        if (onDelete) {
          onDelete()
        }
      })
      .catch(() => {
        window.Tensei.error(
          `An error occured deleting ${resource.name} with ID ${selected[0].id}.`
        )
      })
      .finally(() => {
        if (!leavesPage) {
          setOpen(false)
          setDeleting(false)
        }
      })
  }

  return (
    <ConfirmModal
      confirmButtonProps={{ loading: deleting }}
      onConfirm={onConfirm}
      title={`Delete ${resource.name}`}
      open={open}
      setOpen={setOpen}
      description={`Are you sure you want to delete ${oneItem ? 'this' : ''} ${
        oneItem ? '' : selected.length
      } ${
        oneItem ? resource.name.toLowerCase() : resource.label.toLowerCase()
      }?`}
    ></ConfirmModal>
  )
}

export default DeleteModal
