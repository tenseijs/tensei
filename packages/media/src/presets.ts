import {
    PresetConfigContract,
    PresetContract,
    TransformationContract
} from './types'

export class Preset implements PresetContract {
    settings: PresetConfigContract = {
        disk: '',
        path: '/',
        maxFiles: 10,
        name: 'default',
        maxFieldSize: 1000000, // 1MB
        maxFileSize: 1000000000,
        transformations: [],
        maxFields: 1 // Only preset by default.
    }

    maxFields(max: number) {
        this.settings.maxFields = max
        return this
    }

    disk(disk: string) {
        this.settings.disk = disk

        return this
    }

    preset() {}

    path(path: string) {
        this.settings.path = path

        return this
    }

    maxFiles(max: number) {
        this.settings.maxFiles = max

        return this
    }

    maxFieldSize(max: number) {
        this.settings.maxFieldSize = max

        return this
    }

    maxFileSize(max: number) {
        this.settings.maxFileSize = max

        return this
    }

    transformations(transformations: TransformationContract[]) {
        this.settings.transformations = transformations

        return this
    }
}

export const preset = () => new Preset()
