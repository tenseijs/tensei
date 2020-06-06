import { Db } from 'mongodb'
import { DatabaseRepository } from '../typings/interfaces'

class Repository implements DatabaseRepository {
  constructor(private $db: Db) {}
}

export default Repository
