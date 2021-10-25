import { User } from '@tensei/common'

declare global {
  namespace Express {
    interface User {
      id: number
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
