import { Request, Response } from 'express'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'tranvanlong6677@gmail.com' && password === 'Long6677@') {
    return res.status(200).json({
      message: 'login successfully'
    })
  }
  return res.status(400).json({
    message: 'login failed'
  })
}
