import Gravatar from 'react-gravatar'
import React, { useState } from 'react'
import { Button } from 'evergreen-ui'
import { Transition, Menu } from '@tensei/components'
import { Route, Switch, Link } from 'react-router-dom'

import Nav from '../components/Nav'

import FourOhFour from './404'
import Settings from './Settings'
import ResourceIndex from './ResourceIndex'
import ResourceDetail from './ResourceDetail'
import CreateResource from './CreateResource'

export interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const [offCanvasOpen, setOffCanvasOpen] = useState(false)

  return (
    <>
      <Button>My first evergreen button</Button>
    </>
  )
}

export default Dashboard
