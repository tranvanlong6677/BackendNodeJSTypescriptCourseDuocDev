import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import httpStatus from '~/constants/httpStatus'
import { userMessage } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Erros'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'
export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: userMessage.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: userMessage.NAME_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: userMessage.NAME_LENGTH_MUST_BE_FROM_1_TO_100
        },
        trim: true
      },
      email: {
        notEmpty: {
          errorMessage: userMessage.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: userMessage.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const result = await userServices.checkEmailExist(value)
            if (result) {
              throw new Error('Email already exists')
            }
            return true
          },
          errorMessage: userMessage.EMAIL_ALREADY_EXIST
        }
      },
      password: {
        notEmpty: {
          errorMessage: userMessage.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: userMessage.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: userMessage.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1
          },
          errorMessage: userMessage.PASSWORD_MUST_BE_STRONG
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: userMessage.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: userMessage.CONFIRM_PASSWORD_MUST_BE_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: userMessage.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1
          },
          errorMessage: userMessage.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        custom: {
          options: (value: string, { req }) => {
            if (value !== req.body.password) {
              throw new Error(`Invalid password`)
            }
            return true
          },
          errorMessage: userMessage.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD
        }
      },
      date_of_birth: {
        notEmpty: {
          errorMessage: userMessage.DATE_OF_BIRTH_IS_REQUIRED
        },
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: userMessage.DATE_OF_BIRTH_MUST_BE_ISO8601
        }
      }
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: userMessage.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: userMessage.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (!user) {
              throw new Error(userMessage.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: userMessage.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: userMessage.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: userMessage.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1
          },
          errorMessage: userMessage.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema({
    Authorization: {
      // notEmpty: {
      //   errorMessage: userMessage.ACCESS_TOKEN_IS_REQUIRED
      // },
      custom: {
        options: async (value: string, { req }) => {
          const access_token = (value || '').split(' ')[1]
          if (!access_token) {
            throw new ErrorWithStatus({
              message: userMessage.ACCESS_TOKEN_IS_REQUIRED,
              status: httpStatus.UNAUTHORIZED
            })
          }
          const decoded_authorization = await verifyToken({
            token: access_token,
            secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
          })
          req.decoded_authorization = decoded_authorization
          return true
        }
      }
    }
  })
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        // notEmpty: {
        //   errorMessage: userMessage.REFRESH_TOKEN_IS_REQUIRED
        // },
        // isString: {
        //   errorMessage: userMessage.REFRESH_TOKEN_IS_STRING
        // },
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: userMessage.REFRESH_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const decoded_refresh_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
              })
              const checkRefreshTokenIsExist = await databaseService.refreshToken.findOne(
                { token: value }
              )
              req.decoded_refresh_token = decoded_refresh_token
              if (!checkRefreshTokenIsExist) {
                throw new ErrorWithStatus({
                  message: userMessage.REFRESH_TOKEN_IS_USED_OR_NOT_EXIST,
                  status: httpStatus.UNAUTHORIZED
                })
              }
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: userMessage.REFRESH_TOKEN_IS_INVALID,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

// email verify token
export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: userMessage.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            const decoded_email_verify_token = await verifyToken({
              token: value,
              secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
            })
            req.decoded_email_verify_token = decoded_email_verify_token
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema({
    email: {
      notEmpty: {
        errorMessage: userMessage.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: userMessage.EMAIL_IS_INVALID
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({
            email: value
          })
          if (!user) {
            throw new Error(userMessage.USER_NOT_FOUND)
          }
          req.user = user
          return true
        }
      }
    }
  })
)
