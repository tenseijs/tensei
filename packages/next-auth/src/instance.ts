export interface AuthInstanceContract {
  handleAuth: any
}

const instance: AuthInstanceContract = {
  handleAuth: () => {
    throw new Error('')
  }
}
