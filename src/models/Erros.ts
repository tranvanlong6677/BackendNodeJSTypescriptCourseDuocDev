import httpStatus from '~/constants/httpStatus'
import { userMessage } from '~/constants/messages'

type ErrorsType = Record<string, { msg: string; [key: string]: any }>

// dành cho lỗi thường
export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

// dành cho lỗi validate
export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({
    message = userMessage.VALIDATION_ERROR,
    errors
  }: {
    message?: string
    errors: ErrorsType
  }) {
    super({ message, status: httpStatus.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
