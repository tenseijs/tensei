import TextField from '~/fields/Text'
import SelectField from '~/fields/Select'
import HasManyField from '~/fields/HasMany'
import DateTimeField from '~/fields/DateTime'
import TextareaField from '~/fields/Textarea'
import BelongsToField from '~/fields/BelongsTo'

export default {
    getPath: jest.fn(() => 'string'),
    fieldComponents: {
        TextField,
        SelectField,
        HasManyField,
        DateTimeField,
        TextareaField,
        BelongsToField,
        LinkField: TextField,
        NumberField: TextField,
        IntegerField: TextField,
        DateField: DateTimeField,
    },
    library: {
        Notification: { success: jest.fn(), error: jest.fn() },
    },
}
