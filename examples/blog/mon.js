const Mongoose = require('mongoose')

const User = Mongoose.model(
    'User',
    Mongoose.Schema({
        name: String,
        email: String,
        stories: [
            {
                type: Mongoose.Schema.Types.ObjectId,
                ref: 'Story',
            },
        ],
    })
)

const Story = Mongoose.model(
    'Story',
    Mongoose.Schema({
        title: String,
        description: String,
        user: {
            type: Mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    })
)

Mongoose.connect('mongodb://localhost/mon-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    const u = await User.findOne({
        _id: '5f823690ba66d136204c4386',
    })

    console.log(
        await Story.find({
            _id: {
                $in: u.stories,
            },
        })
    )

    await Mongoose.connection.close()
})
