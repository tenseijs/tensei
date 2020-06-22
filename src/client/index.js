import './Flamingo'

import React from 'react'
import ReactDOM from 'react-dom'
import Wrapper from './components/Wrapper'
import { loadTheme } from '@fluentui/react'
import { initializeIcons } from '@uifabric/icons'

loadTheme({
    palette: {
        themePrimary: '#007eff',
        themeLighterAlt: '#f5faff',
        themeLighter: '#d6ebff',
        themeLight: '#b3d9ff',
        themeTertiary: '#66b3ff',
        themeSecondary: '#1f8fff',
        themeDarkAlt: '#0073e6',
        themeDark: '#0061c2',
        themeDarker: '#00478f',
        neutralLighterAlt: '#faf9f8',
        neutralLighter: '#f3f2f1',
        neutralLight: '#edebe9',
        neutralQuaternaryAlt: '#e1dfdd',
        neutralQuaternary: '#d0d0d0',
        neutralTertiaryAlt: '#c8c6c4',
        neutralTertiary: '#a19f9d',
        neutralSecondary: '#605e5c',
        neutralPrimaryAlt: '#3b3a39',
        neutralPrimary: '#323130',
        neutralDark: '#201f1e',
        black: '#000000',
        white: '#ffffff',
    },
})

initializeIcons()

ReactDOM.render(<Wrapper />, document.getElementById('app'))
