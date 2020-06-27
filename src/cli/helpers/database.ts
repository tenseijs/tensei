import Path from 'path'
import Mongo from 'mongodb'
import Dotenv from 'dotenv'

export default async () => {
    Dotenv.config({
        path: Path.join(process.env.PWD!, '.env'),
    })

    const client = new Mongo.MongoClient(process.env.DATABASE_URI!, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    await client.connect()

    return client
}
