import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'
const userRouters = Router()

userRouters.post('/login', loginValidator, loginController)
userRouters.post('/register', registerController)

export default userRouters
