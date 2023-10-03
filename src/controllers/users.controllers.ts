import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { userMessage } from '~/constants/messages'
import { RegisterRequestBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import userServices from '~/services/users.services'
export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userServices.login(user_id.toString())
  return res.json({
    message: userMessage.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response
) => {
  const result = await userServices.register(req.body)
  return res.json({
    message: userMessage.REGISTER_SUCCESS,
    result
  })
}
