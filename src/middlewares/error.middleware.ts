import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import httpStatus from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Erros'

export const defaultErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ErrorWithStatus) {
    res.status(err.status).json(omit(err, ['status']))
  }
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    error: omit(err, ['stack'])
  })
  console.log(err)
}
