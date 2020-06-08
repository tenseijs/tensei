import { Db } from 'mongodb'
import { DatabaseRepository } from '../typings/interfaces'

class Repository implements DatabaseRepository {
    constructor(private $db: Db) {}

    public admin = () => {
        return this.$db.collection('administrators')
    }
}

export default Repository
