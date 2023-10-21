import express from 'express'
import userRouters from './routes/users.routes'
import databaseService from './services/database.services'
import dotenv from 'dotenv'
import { defaultErrorHandler } from './middlewares/error.middleware'
const app = express()
const port = process.env.PORT || 8080
import cors from 'cors'
dotenv.config()
app.use(cors())
// connect database
databaseService.run()

// Middlewares
// parse req.body
app.use(express.json())
app.use('/users', userRouters)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
