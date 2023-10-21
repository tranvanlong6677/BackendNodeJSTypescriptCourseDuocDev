import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterRequestBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/utils/enums'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import dotenv from 'dotenv'
import { userMessage } from '~/constants/messages'

dotenv.config()
class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,

      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,

      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,

      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    await databaseService.users.insertOne(
      new User({
        _id: user_id,
        ...payload,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    // const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(
      user_id.toString()
    )
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id.toString()),
        token: refresh_token
      })
    )
    console.log('email verify token', email_verify_token)
    return {
      access_token,
      refresh_token
    }
  }
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({
      email
    })
    return user ? true : false
  }
  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return {
      access_token,
      refresh_token
    }
  }
  async logout(refresh_token: string) {
    await databaseService.refreshToken.deleteOne({ token: refresh_token })
    return {
      message: userMessage.LOGOUT_SUCCESS
    }
  }

  async verifyEmail(user_id: string) {
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token: '',
          updated_at: '$$NOW',
          verify: UserVerifyStatus.Verified
        }
        // $currentDate: {
        //   updated_at: true
        // }
      }
    ])

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    // Coi như gửi email resend
    console.log('Resend verify email', email_verify_token)
    const result = await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token }, $currentDate: { updated_at: true } }
    )
    return {
      result
    }
  }

  async forgotPassword(user_id: string) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    console.log('>>> check sign', forgot_password_token)
    const result = await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    //  gửi email kèm link đến email người dùng kiểu : https://twitter.com/forgot-password?token=token
    console.log('forgot_password_token', forgot_password_token)
    return {
      message: userMessage.CHECK_FORGOT_PASSWORD_SUCCESS
    }
  }
}

const userServices = new UserService()
export default userServices
