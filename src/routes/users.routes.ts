import { Router } from 'express'
import {
  loginController,
  registerController
} from '~/controllers/users.controllers'
import {
  loginValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { validate } from '../utils/validation'
const userRouters = Router()

userRouters.post('/login', loginValidator, loginController)
userRouters.post(
  '/register',
  validate(registerValidator),
  registerController
)

export default userRouters
