import { User } from '@tensei/common'

declare global {
  namespace Express {
    export interface Request {
      user: User
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    user: {
      id: number
    }
  }
}
