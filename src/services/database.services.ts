import { MongoClient, ServerApiVersion } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ika8xjo.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient

  constructor() {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
  }
  run = async () => {
    try {
      await this.client.connect()
      await this.client.db('admin').command({ ping: 1 })
      console.log('You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
    } finally {
      await this.client.close()
    }
  }
}
const databaseConnect = new DatabaseService()
export default databaseConnect
