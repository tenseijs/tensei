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
        query = {},
        params: {
            perPage: number
            page: number
        }
    ): Promise<any> => {
        let builder = this.$db
            .collection(collectionName)
            .find(query)
            .limit(params.perPage)
            .skip(params.perPage * params.page - 1)
        const total = await builder.count()

        return {
            total,
            page: params.page,
            perPage: params.perPage,
            data: await builder.toArray(),
            pageCount: Math.ceil(total / params.perPage),
        }
    }
}

export default Repository
