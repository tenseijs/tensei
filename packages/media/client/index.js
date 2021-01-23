import { FormFile, FormFiles, DetailFile, DetailFiles } from './Components'

import { Media } from './Media'

window.Tensei.register(({ route, formComponent, detailComponent }) => {
    formComponent('File', FormFile)
    formComponent('Files', FormFiles)
    detailComponent('File', DetailFile)
    detailComponent('Files', DetailFiles)

    route({
        path: 'media',
        name: 'Media Library',
        icon: 'tag',
        component: Media,
        requiredPermissions: []
    })
})
