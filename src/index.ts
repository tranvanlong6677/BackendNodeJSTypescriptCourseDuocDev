import express from 'express'
import userRouters from './routes/users.routes'

const app = express()
const port = 3000
const router = express.Router()

// Middlewares
// parse req.body
app.use(express.json())
app.use('/api', router)
app.use('/users', userRouters)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
