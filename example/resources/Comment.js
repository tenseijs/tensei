const { Resource, ID, Text, Textarea, BelongsTo } = require('@flamingo/core')

class Comment extends Resource {
    fields() {
        return [
            ID.make(),
            Text.make('Title'),
            Textarea.make('Body'),
            BelongsTo.make('Post'),
        ]
    }
}

module.exports = Comment
