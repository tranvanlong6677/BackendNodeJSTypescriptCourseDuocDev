import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { TokenPayload } from '~/models/requests/User.requests'

dotenv.config()
interface signInput {
  payload: string | Buffer | object
  privateKey: string
  options?: jwt.SignOptions
}

export const signToken = ({
  payload,
  privateKey,
  options = {
    algorithm: 'HS256'
  }
}: signInput) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        throw reject(error)
      }
      resolve(token as string)
    })
  })
}

// verify: kiểm tra xem chữ ký của token gửi từ phía client có đúng là được hash(băm) bởi cùng 1 thuật toán với chuỗi secret hay không
export const verifyToken = ({
  token,
  secretOrPublicKey
}: {
  token: string
  secretOrPublicKey: string
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      console.log('token', token)
      console.log('secretOrPublicKey', secretOrPublicKey)
      console.log('decoded', decoded)

      if (error) {
        console.log(111)
        console.log('error', error)
        throw reject(error)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
