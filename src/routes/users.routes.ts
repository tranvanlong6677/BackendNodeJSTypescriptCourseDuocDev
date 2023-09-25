import { Router } from 'express'
import { loginController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'
const userRouters = Router()

userRouters.post('/login', loginValidator, loginController)

export default userRouters
