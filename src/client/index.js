import './Flamingo'

import React from 'react'
import ReactDOM from 'react-dom'
import Wrapper from './components/Wrapper'
import { initializeIcons } from '@uifabric/icons'

initializeIcons()

ReactDOM.render(<Wrapper />, document.getElementById('app'))
