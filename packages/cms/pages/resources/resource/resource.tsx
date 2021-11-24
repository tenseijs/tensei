import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { FieldContract } from '@tensei/components'
import { useParams, useHistory } from 'react-router-dom'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { EuiPopover } from '@tensei/eui/lib/components/popover'
import { EuiFieldText } from '@tensei/eui/lib/components/form/field_text'
import { EuiButtonEmpty, EuiButton } from '@tensei/eui/lib/components/button'
import {
  EuiBasicTable,
  EuiBasicTableProps,
  EuiBasicTableColumn,
  CriteriaWithPagination
} from '@tensei/eui/lib/components/basic_table'
import {
  EuiContextMenu,
  EuiContextMenuPanelDescriptor
} from '@tensei/eui/lib/components/context_menu'
import { EuiConfirmModal } from '@tensei/eui/lib/components/modal/confirm_modal'
import { useGeneratedHtmlId } from '@tensei/eui/lib/services/accessibility'
import { EuiFieldSearch } from '@tensei/eui/lib/components/form/field_search'

import { DashboardLayout } from '../../components/dashboard/layout'
import { useEffect } from 'react'
import {
  useResourceStore,
  filterClauses,
  FilterClause
} from '../../../store/resource'
import { useToastStore } from '../../../store/toast'

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
`

const SearchAndFilterContainer = styled.div`
  gap: 0.75rem;
  display: flex;
  width: 50%;
  align-items: center;
`

const FilterContent = styled.div`
  padding: 1rem;
`

const FilterActions = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

type FieldWithPanelId = FieldContract & {
  panel: string
}

const FilterValue: React.FunctionComponent<{
  field: FieldContract
  filterClause: FilterClause
  onCancel: () => void
  onApply: (value: any) => void
}> = ({ onApply, onCancel }) => {
  const [value, setValue] = useState('')

  return (
    <FilterContent>
      <EuiFieldText
        placeholder="Example: 43"
        onChange={event => setValue(event.target.value)}
      />
      <FilterActions>
        <EuiButtonEmpty size="s" color="danger" onClick={() => onCancel()}>
          Cancel
        </EuiButtonEmpty>

        <EuiButton size="s" fill onClick={() => onApply(value)}>
          Apply
        </EuiButton>
      </FilterActions>
    </FilterContent>
  )
}

export const FilterList: React.FunctionComponent = () => {
  const [open, setOpen] = useState(false)
  const { resource, applyFilter } = useResourceStore()

  const contextMenuPopoverId = useGeneratedHtmlId({
    prefix: 'contextMenuPopover'
  })
  const onApply = (field: FieldContract, clause: FilterClause, value: any) => {
    applyFilter({
      field,
      clause,
      value
    })

    setOpen(false)
  }

  const panels: EuiContextMenuPanelDescriptor[] = useMemo(() => {
    // For now, we won't support filtering by relationship fields.
    const fields =
      resource?.fields.filter(
        field => !field.isRelationshipField && !field.isVirtual
      ) || []

    const getClausesForField = (field: FieldContract) => {
      // Checking field type, find all the clauses that apply to this field.
      // For example, integer, decimal, float, number field types should only
      // be shown clauses with type of "number".
      return filterClauses
    }

    return [
      {
        id: 0,
        title: 'Select a field',
        items: [
          ...fields.map((field, idx) => ({
            name: field.name,
            panel: `where-${field.databaseField}-${idx}`
          }))
        ]
      },

      ...fields.map((field, idx) => ({
        id: `where-${field.databaseField}-${idx}`,
        width: 350,
        title: `Filter ${resource?.label?.toLowerCase()} where ${field?.name?.toLowerCase()}:`,
        items: [
          ...getClausesForField(field).map((clause, clauseIdx) => ({
            name: clause.name,
            panel: `filter-value-${field.databaseField}-${clauseIdx}-${idx}`
          }))
        ]
      })),

      ...fields
        .map((field, idx) =>
          getClausesForField(field).map((clause, clauseIdx) => ({
            id: `filter-value-${field.databaseField}-${clauseIdx}-${idx}`,
            title: `Filter ${resource?.label?.toLowerCase()} where ${field?.name?.toLowerCase()} ${clause.name.toLowerCase()}:`,
            width: 400,
            content: (
              <FilterValue
                field={field}
                filterClause={clause}
                onCancel={() => setOpen(false)}
                onApply={value => onApply(field, clause, value)}
              />
            )
          }))
        )
        .flat()
    ]
  }, [resource])

  return (
    <EuiPopover
      isOpen={open}
      id={contextMenuPopoverId}
      panelPaddingSize="none"
      closePopover={() => setOpen(false)}
      anchorPosition="downCenter"
      button={
        <EuiButtonEmpty
          iconSide="right"
          iconType="arrowDown"
          onClick={() => setOpen(true)}
        >
          Filters
        </EuiButtonEmpty>
      }
    >
      <EuiContextMenu initialPanelId={0} panels={panels}></EuiContextMenu>
    </EuiPopover>
  )
}
interface MetaData {
  page: number
  pageCount: number
  perPage: number
  total: number
}

export const Table: React.FunctionComponent = () => {
  const { resource, applyFilter, fetchTableData, deleteTableData } =
    useResourceStore()
  const [pageSize, setPageSize] = useState(resource?.perPageOptions[0])
  const [pageIndex, setPageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [items, setItems] = useState([])
  const [metaData, setMetaData] = useState<MetaData>()
  const [itemsSelectedForDelete, setItemsSelectedForDelete] = useState<
    string[]
  >([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false)
  const getData = async () => {
    const params = {
      page: pageIndex + 1,
      perPage: pageSize,
      sort: `${sortField}:${sortDirection}`,
      sortField
    }

    const [data, error] = await fetchTableData(params)

    if (!error) {
      setItems(data?.data.data)
      setMetaData(data?.data.meta)
      setLoading(false)
    }
    setLoading(false) // if there is an error so it doesn't load forever
  }

  useEffect(() => {
    setLoading(true)

    getData()
  }, [resource, pageIndex, pageSize, sortField, sortDirection])

  const { toast } = useToastStore()

  const deleteItem = async () => {
    if (itemsSelectedForDelete.length === 0) return

    const [response, error] = await deleteTableData(itemsSelectedForDelete)
    if (!error) {
      if (selectedItems.length > 1) {
        toast(
          'Deleted',
          <p>Selected {resource?.slugPlural} have been deleted successfully</p>
        )
        getData()
        return
      }
      toast(
        'Deleted',
        <p>{resource?.name.toLowerCase()} has been deleted successfully</p>
      )
      getData()
    } else {
      toast('Failed to delete', <p>An error occured, please try again.</p>)
    }
  }

  const columns: EuiBasicTableColumn<any>[] = useMemo(() => {
    return [
      ...(resource?.fields
        .filter(field => field.showOnIndex)
        .map(field => ({
          name: field.name,
          field: field.databaseField,
          sortable: field.isSortable,
          truncateText: true
        })) || []),
      {
        name: 'Actions',
        actions: [
          {
            name: 'Delete',
            description: 'Delete this item',
            icon: 'trash',
            type: 'icon',
            color: 'danger',

            onClick: item => {
              setIsModalVisible(true)
              setItemsSelectedForDelete([item.id])
            }
          }
        ]
      }
    ]
  }, [resource])

  const ConfirmDeleteModal = () => {
    const closeModal = () => setIsModalVisible(false)

    if (isModalVisible) {
      return (
        <EuiConfirmModal
          title={`Do you want to delete ${
            selectedItems.length > 1
              ? `these ${resource?.slugPlural}?`
              : `this ${resource?.name.toLowerCase()}?`
          }
          `}
          onCancel={closeModal}
          onConfirm={async () => {
            setDeleteButtonLoading(true)
            await deleteItem()
            setDeleteButtonLoading(false)
            closeModal()
          }}
          cancelButtonText="Cancel"
          confirmButtonText={`Delete ${
            selectedItems.length > 1
              ? resource?.slugPlural
              : resource?.name.toLowerCase()
          }`}
          isLoading={deleteButtonLoading}
          buttonColor="danger"
          defaultFocusedButton="confirm"
        >
          <p>
            You&rsquo;re about to permanently delete
            {selectedItems.length > 1
              ? ` these ${resource?.slugPlural}`
              : ` this ${resource?.name.toLowerCase()}`}
          </p>
          <p>Are you sure you want to do this?</p>
        </EuiConfirmModal>
      )
    } else {
      return null
    }
  }

  const pagination: EuiBasicTableProps<any>['pagination'] = {
    pageIndex,
    pageSize: pageSize!,
    totalItemCount: metaData?.total!,
    pageSizeOptions: resource?.perPageOptions
  }

  const onTableChange = ({ page, sort }: CriteriaWithPagination<any>) => {
    setPageIndex(page.index)
    setPageSize(page.size)
    setSortDirection(sort?.direction!)
    setSortField(sort?.field as string)
  }

  const DeleteButtonContainer = styled.div`
    display: flex;
    align-self: flex-end;
  `

  return (
    <>
      {selectedItems.length ? (
        <>
          <DeleteButtonContainer>
            <EuiButton
              onClick={() => {
                const items: string[] = selectedItems.map(item => item.id)
                setItemsSelectedForDelete([...items])
                setIsModalVisible(true)
              }}
              color="danger"
              size="s"
            >
              Delete {selectedItems.length} item
              {selectedItems.length > 1 ? 's' : ''}
            </EuiButton>
          </DeleteButtonContainer>
        </>
      ) : null}

      <EuiBasicTable
        items={items}
        itemId={'id'}
        columns={columns}
        hasActions={true}
        loading={loading}
        selection={{
          selectable: () => true,
          onSelectionChange: setSelectedItems,
          selectableMessage: selectable =>
            selectable ? '' : 'Cannot select this product.'
        }}
        isSelectable={true}
        sorting={{
          sort: {
            field: sortField,
            direction: sortDirection
          }
        }}
        pagination={pagination}
        onChange={onTableChange}
      />
      <ConfirmDeleteModal />
    </>
  )
}

export const Resource: React.FunctionComponent = () => {
  const { push } = useHistory()
  const { findResource, resource } = useResourceStore()
  const { resource: resourceSlug } = useParams<{
    resource: string
  }>()

  useEffect(() => {
    const found = findResource(resourceSlug)

    if (!found) {
      push(window.Tensei.getPath(''))
    }
  }, [resourceSlug])

  if (!resource) {
    return <p>Loading ...</p> // show full page loader here.
  }

  return (
    <DashboardLayout>
      <TableWrapper>
        <HeaderContainer>
          <SearchAndFilterContainer>
            <EuiFieldSearch
              placeholder={`Search ${resource.label.toLowerCase()}`}
            />
            <FilterList />
          </SearchAndFilterContainer>
        </HeaderContainer>

        <EuiSpacer size="xl" />

        <Table />
      </TableWrapper>
    </DashboardLayout>
  )
}
