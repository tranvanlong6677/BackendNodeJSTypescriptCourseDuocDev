import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterRequestBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'
export const loginController = (
  req: Request,
  res: Response
) => {
  const { email, password } = req.body
  if (
    email === 'tranvanlong6677@gmail.com' &&
    password === 'Long6677@'
  ) {
    return res.status(200).json({
      message: 'login successfully'
    })
  }
  return res.status(400).json({
    message: 'login failed'
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response
) => {
  try {
    const result = await userServices.register(req.body)
    return res.json({
      message: 'Register success',
      result
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: 'register failed'
    })
  }
}
