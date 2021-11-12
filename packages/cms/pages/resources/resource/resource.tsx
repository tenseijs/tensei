import React, { useState } from 'react'
import styled from 'styled-components'
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
import { useGeneratedHtmlId } from '@tensei/eui/lib/services/accessibility'
import { EuiFieldSearch } from '@tensei/eui/lib/components/form/field_search'

import { DashboardLayout } from '../../components/dashboard/layout'

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

const filterCompareValues = [
  'Is exactly',
  'Is not exactly',
  'Is greater than',
  'Is less than',
  'Is greater than or equal to',
  'Is less than or equal to',
  'Is one of',
  'Is not one of'
]

export const FilterList: React.FunctionComponent = () => {
  const [open, setOpen] = useState(false)
  const contextMenuPopoverId = useGeneratedHtmlId({
    prefix: 'contextMenuPopover'
  })

  const urlSlug = window.location.href.split('resources/')[1]

  const resources = window.Tensei.state.resources
  const [currentResource] = resources.filter(
    resource => urlSlug === resource.slug
  )

  const panels: EuiContextMenuPanelDescriptor[] = [
    {
      id: 0,
      title: 'Select a field',
      items: [
        {
          name: 'Title',
          panel: 1
        },
        {
          name: currentResource.name,
          panel: 1
        }
      ]
    },

    {
      id: 1,
      title: 'Filter products where title',
      items: [
        ...filterCompareValues.map(value => ({
          name: value,
          panel: 2
        }))
      ]
    },

    {
      id: 2,
      title: 'Filter products where title is greater than:',
      width: 400,
      content: (
        <FilterContent>
          <EuiFieldText placeholder="Example: 43" />
          <FilterActions>
            <EuiButtonEmpty
              size="s"
              color="danger"
              onClick={() => setOpen(false)}
            >
              Cancel
            </EuiButtonEmpty>

            <EuiButton size="s" fill>
              Apply
            </EuiButton>
          </FilterActions>
        </FilterContent>
      )
    }
  ]

  return (
    <EuiPopover
      isOpen={open}
      closePopover={() => setOpen(false)}
      id={contextMenuPopoverId}
      panelPaddingSize="none"
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

export const Table: React.FunctionComponent = () => {
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [sortField, setSortField] = useState('firstName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const columns: EuiBasicTableColumn<any>[] = [
    {
      field: 'firstName',
      name: 'First name',
      sortable: true,
      truncateText: true
    },
    {
      field: 'lastName',
      name: 'Last name',
      sortable: true,
      truncateText: true
    },
    {
      name: 'Date of birth',
      field: 'dateOfBirth'
    },
    {
      name: 'Nationality',
      field: 'nationality'
    },
    {
      name: 'Actions',
      actions: [
        {
          name: 'Delete',
          description: 'Delete this item',
          icon: 'trash',
          type: 'icon',
          color: 'danger',
          onClick: console.log
        }
      ]
    }
  ]

  const items = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      github: 'johndoe',
      dateOfBirth: Date.now(),
      nationality: 'NL',
      online: true
    }
  ]

  const pagination: EuiBasicTableProps<any>['pagination'] = {
    pageIndex: 0,
    pageSize: 10,
    totalItemCount: 344,
    pageSizeOptions: [10, 25, 50, 100]
  }

  const onTableChange = ({ page, sort }: CriteriaWithPagination<any>) => {
    setPageIndex(page.index)
    setPageSize(page.size)
    setSortDirection(sort?.direction!)
    setSortField(sort?.field as string)
  }

  return (
    <EuiBasicTable
      items={items}
      itemId={'id'}
      columns={columns}
      hasActions={true}
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
  )
}

export const Resource: React.FunctionComponent = () => {
  return (
    <DashboardLayout>
      <TableWrapper>
        <HeaderContainer>
          <SearchAndFilterContainer>
            <EuiFieldSearch placeholder="Search products" />

            <FilterList />
          </SearchAndFilterContainer>
        </HeaderContainer>

        <EuiSpacer size="xl" />

        <Table />
      </TableWrapper>
    </DashboardLayout>
  )
}
