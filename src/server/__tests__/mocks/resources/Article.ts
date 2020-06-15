import ID from '../../../fields/ID'
import Text from '../../../fields/Text'
import DateField from '../../../fields/Date'
import Resource from '../../../resources/Resource'

class Article extends Resource {
    messages() {
        return {
            'title.required': 'The title field is required.',
            'publishedAt.required': 'The published at field is required.',
            'publishedAt.date': 'The date field must be a valid date format.',
        }
    }

    fields() {
        return [
            ID.make(),
            Text.make('Title')
                .sortable()
                .rules('required', 'string', 'min:6', 'max:20')
                .creationRules('required'),
            DateField.make('Published at')
                .firstDayOfWeek(4)
                .rules('required', 'date'),
        ]
    }
}

export default Article
