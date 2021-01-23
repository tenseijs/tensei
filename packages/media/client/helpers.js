const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

const imageExtensions = [
    'ase',
    'art',
    'bmp',
    'blp',
    'cd5',
    'cit',
    'cpt',
    'cr2',
    'cut',
    'dds',
    'dib',
    'djvu',
    'egt',
    'exif',
    'gif',
    'gpl',
    'grf',
    'icns',
    'ico',
    'iff',
    'jng',
    'jpeg',
    'jpg',
    'jfif',
    'jp2',
    'jps',
    'lbm',
    'max',
    'miff',
    'mng',
    'msp',
    'nitf',
    'ota',
    'pbm',
    'pc1',
    'pc2',
    'pc3',
    'pcf',
    'pcx',
    'pdn',
    'pgm',
    'PI1',
    'PI2',
    'PI3',
    'pict',
    'pct',
    'pnm',
    'pns',
    'ppm',
    'psb',
    'psd',
    'pdd',
    'psp',
    'px',
    'pxm',
    'pxr',
    'qfx',
    'raw',
    'rle',
    'sct',
    'sgi',
    'rgb',
    'int',
    'bw',
    'tga',
    'tiff',
    'tif',
    'vtf',
    'xbm',
    'xcf',
    'xpm',
    '3dv',
    'amf',
    'ai',
    'awg',
    'cgm',
    'cdr',
    'cmx',
    'dxf',
    'e2d',
    'egt',
    'eps',
    'fs',
    'gbr',
    'odg',
    'svg',
    'stl',
    'vrml',
    'x3d',
    'sxd',
    'v2d',
    'vnd',
    'wmf',
    'emf',
    'art',
    'xar',
    'png',
    'webp',
    'jxr',
    'hdp',
    'wdp',
    'cur',
    'ecw',
    'iff',
    'lbm',
    'liff',
    'nrrd',
    'pam',
    'pcx',
    'pgf',
    'sgi',
    'rgb',
    'rgba',
    'bw',
    'int',
    'inta',
    'sid',
    'ras',
    'sun',
    'tga'
]

export const niceBytes = x => {
    let l = 0,
        n = parseInt(x, 10) || 0

    while (n >= 1024 && ++l) {
        n = n / 1024
    }

    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]
}

export const getSecondSmallestSizeHash = asset => {
    const transforms = asset.transformations.sort(
        (tA, tB) => tA.width - tB.width
    )

    if (transforms.length >= 2) {
        return transforms[1].hash
    }

    if (transforms.length === 1) {
        return transforms[0].hash
    }

    return asset.hash
}

export const getFileType = file => {
    if (isImage(file)) {
        return 'IMAGE'
    }

    return file.extension
}

export const isImage = asset => imageExtensions.includes(asset.extension)

export const getFullAssetPath = asset => {
    return `${window.Tensei.state.config.serverUrl}${
        asset.path
    }${getSecondSmallestSizeHash(asset)}.${asset.extension}`
}
