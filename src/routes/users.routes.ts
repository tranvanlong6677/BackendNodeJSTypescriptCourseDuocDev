import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { validate } from '../utils/validation'
import { wrapRequestHandler } from '~/utils/handlers'
const userRouters = Router()

userRouters.post('/login', validate(loginValidator), wrapRequestHandler(loginController))
userRouters.post(
  '/register',
  validate(registerValidator),
  wrapRequestHandler(registerController)
)

export default userRouters
