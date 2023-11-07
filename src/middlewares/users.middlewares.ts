import { NextFunction } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import httpStatus from '~/constants/httpStatus'
import { userMessage } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Erros'
import { TokenPayload } from '~/models/requests/User.requests'
import userRouters from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { UserVerifyStatus } from '~/utils/enums'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'
const passwordSchema: ParamSchema = {
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

const confirmPasswordSchema: ParamSchema = {
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
}

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: userMessage.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: httpStatus.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        console.log(
          '>>> check decoded_forgot_password_token',
          decoded_forgot_password_token
        )
        const { user_id } = decoded_forgot_password_token
        const user = await databaseService.users.findOne({
          _id: new ObjectId(user_id)
        })
        if (!user) {
          throw new ErrorWithStatus({
            message: userMessage.USER_NOT_FOUND,
            status: httpStatus.UNAUTHORIZED
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: userMessage.FORGOT_PASSWORD_TOKEN_IS_INVALID,
            status: httpStatus.UNAUTHORIZED
          })
        }
        req.decoded_forgot_password_token = decoded_forgot_password_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: error.message,
            status: httpStatus.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: userMessage.IMAGE_URL_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: userMessage.IMAGE_URL_LENGTH
  },
  trim: true
}

const dateOfBirthSchema: ParamSchema = {
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

const nameSchema: ParamSchema = {
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
}
export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
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
      date_of_birth: dateOfBirthSchema
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
export const verifyForgotPasswordValidator = validate(
  checkSchema({
    forgot_password_token: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: userMessage.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
              status: httpStatus.UNAUTHORIZED
            })
          }
          try {
            const decoded_forgot_password_token = await verifyToken({
              token: value,
              secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
            })
            console.log(
              '>>> check decoded_forgot_password_token',
              decoded_forgot_password_token
            )
            const { user_id } = decoded_forgot_password_token
            const user = await databaseService.users.findOne({
              _id: new ObjectId(user_id)
            })
            if (!user) {
              throw new ErrorWithStatus({
                message: userMessage.USER_NOT_FOUND,
                status: httpStatus.UNAUTHORIZED
              })
            }
            if (user.forgot_password_token !== value) {
              throw new ErrorWithStatus({
                message: userMessage.FORGOT_PASSWORD_TOKEN_IS_INVALID,
                status: httpStatus.UNAUTHORIZED
              })
            }
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: error.message,
                status: httpStatus.UNAUTHORIZED
              })
            }
            throw error
          }
          return true
        }
      }
    }
  })
)

export const resetPasswordValidator = validate(
  checkSchema({
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    forgot_password_token: forgotPasswordTokenSchema
  })
)

export const verifiedUserValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    console.log(111)
    return next(
      new ErrorWithStatus({
        message: userMessage.USER_NOT_VERIFIED,
        status: httpStatus.FORBIDDEN
      })
    )
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: { ...nameSchema, optional: true, notEmpty: undefined },
      date_of_birth: { ...dateOfBirthSchema, optional: true },
      bio: {
        optional: true,
        isString: {
          errorMessage: userMessage.BIO_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: userMessage.BIO_LENGTH
        },
        trim: true
      },
      location: {
        optional: true,
        isString: {
          errorMessage: userMessage.LOCATION_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: userMessage.LOCATION_LENGTH
        },
        trim: true
      },
      website: {
        optional: true,
        isString: {
          errorMessage: userMessage.WEBSITE_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 400
          },
          errorMessage: userMessage.WEBSITE_LENGTH
        },
        trim: true
      },
      username: {
        optional: true,
        isString: {
          errorMessage: userMessage.USERNAME_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: userMessage.USERNAME_LENGTH
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)
