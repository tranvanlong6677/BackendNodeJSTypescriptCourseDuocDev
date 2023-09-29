import jwt from 'jsonwebtoken'
interface signInput {
  payload: string | Buffer | object
  privateKey?: string
  options?: jwt.SignOptions
}

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = {
    algorithm: 'HS256'
  }
}: signInput) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      payload,
      privateKey,
      options,
      (error, token) => {
        if (error) {
          throw reject(error)
        }
        resolve(token as string)
      }
    )
  })
}
