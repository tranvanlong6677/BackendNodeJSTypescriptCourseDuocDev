import { checkSchema } from 'express-validator'
import { userMessage } from '~/constants/messages'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'

export const registerValidator = checkSchema({
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
})

export const loginValidator = checkSchema({
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
})
