import { User } from '@tensei/common'

declare global {
  namespace Express {
    interface User {
      password: string
      firstName: string
      lastName: string
      email: string
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
