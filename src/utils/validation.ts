import express from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import httpStatus from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Erros'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    await validation.run(req)
    const errors = validationResult(req)
    const errorsObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })

    if (errors.isEmpty()) {
      return next()
    }
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      if (
        msg instanceof ErrorWithStatus &&
        msg.status !== httpStatus.UNPROCESSABLE_ENTITY
      ) {
        return next(msg)
      }
      entityError.errors[key] = errorsObject[key]
    }

    next(entityError)
  }
}
