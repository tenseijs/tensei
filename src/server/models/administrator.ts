import Mongodb from 'mongodb'

export default (db: Mongodb.Db) => {
    return db.collection('administrators')
}
