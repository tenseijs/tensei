import { Db } from 'mongodb'

class Repository {
    constructor(private $db: Db) {}

    public admin = () => {
        return this.$db.collection('administrators')
    }

    /**
     * Insert a new record into the database
     * collection specified
     */
    public insertOne = async (
        collectionName: string,
        data: {
            [key: string]: any
        }
    ): Promise<[boolean, any]> => {
        try {
            const result = await this.$db
                .collection(collectionName)
                .insertOne(data)

            return [true, result]
        } catch (errors) {
            return [false, errors]
        }
    }

    public findAll = async (
        collectionName: string,
        query: {} = {}
    ): Promise<any> => {
        return this.$db.collection(collectionName).find(query).toArray()
    }
}

export default Repository
