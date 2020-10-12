import Field from './Field'

type AllowedDisks = 'public' | 'private'

export class Image extends Field {
    public selectedDisk: AllowedDisks = 'public'

    public component = 'FileField'

    /**
     * When a new file is made,
     * we'll allow it to be downloaded
     *
     */
    public constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.attributes = {
            maxSize: 20000
        }
    }

    /**
     * Set a disk on the user's filesystem where the underlying file
     * would be stored
     *
     */
    public disk(disk: AllowedDisks) {
        this.selectedDisk = disk

        return this
    }

    // todo add a method for setting formats allowed
}

export const image = (name: string, databaseField?: string) =>
    new Image(name, databaseField)

export default Image
