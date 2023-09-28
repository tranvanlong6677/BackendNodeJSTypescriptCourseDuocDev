import express from 'express'
import userRouters from './routes/users.routes'
import databaseService from './services/database.services'
import dotenv from 'dotenv'

const app = express()
const port = process.env.PORT || 8080
const router = express.Router()
dotenv.config()

// Middlewares
// parse req.body
databaseService.run()
app.use(express.json())
app.use('/api', router)
app.use('/users', userRouters)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
