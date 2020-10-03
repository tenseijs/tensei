import TextField from '~/fields/Text'
import SelectField from '~/fields/Select'
import HasManyField from '~/fields/HasMany'
import DateTimeField from '~/fields/DateTime'
import TextareaField from '~/fields/Textarea'
import BelongsToField from '~/fields/BelongsTo'
import LinkField from '~/index-fields/Link'
import TextIndexField from '~/index-fields/Text'
import DateIndexField from '~/index-fields/Date'

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
        DateField: DateTimeField
    },
    library: {
        Notification: { success: jest.fn(), error: jest.fn() }
    },
    indexFieldComponents: {
        LinkField,
        TextField: TextIndexField,
        IDField: TextIndexField,
        NumberField: TextField,
        DateField: DateIndexField
    }
}
