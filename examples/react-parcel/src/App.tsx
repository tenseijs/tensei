import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { createBrowserHistory } from 'history'
import { Router, Route, Link } from 'react-router-dom'
import {
  TenseiAuthProvider,
  useAuth,
  useTensei,
  MustBeAuthenticated,
  MustBeNotAuthenticated
} from '@tensei/react-auth'

export const history = createBrowserHistory()

const onRedirectCallback = (path: string) => history.replace(path)

const LoginPage: React.FunctionComponent = () => {
  const tensei = useTensei()

  const onSubmit = (event: any) => {
    event.preventDefault()

    const [email, password] = event.target.elements

    tensei.auth().register({
      object: {
        email: email.value,
        password: password.value,
        accepted_terms_and_conditions: true
      }
    })
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="email"
          placeholder="email"
          defaultValue={`parcel+${Math.ceil(
            Math.random() * 5000
          )}@tenseijs.com`}
        />
        <input
          type="text"
          name="password"
          placeholder="password"
          defaultValue={`password`}
        />

        <br />
        <button>login to your account</button>
      </form>

      <br />
      <br />
      <a href={tensei.auth().socialRedirectUrl('google')}>Login with google</a>
    </div>
  )
}

const DashboardPage: React.FunctionComponent = () => {
  const { user } = useAuth()
  const tensei = useTensei()

  const logout = () => {
    tensei.auth().logout()
  }

  return (
    <div>
      <h1>Welcome to your dashboard, {user?.email}</h1>
      <br />
      <br />
      <button onClick={logout}>Logout</button>
    </div>
  )
}

const WelcomePage: React.FunctionComponent = () => {
  return (
    <>
      <h1>Welcome to our website.</h1>
      <br />

      <Link to="/auth/login">Login to our app</Link>
      <br />
      <Link to="/dashboard">Attempt to go to dashboard</Link>
    </>
  )
}

const App: React.FunctionComponent = () => {
  return (
    <TenseiAuthProvider
      options={{
        refreshTokens: true
      }}
      Loader={() => <h1>LOADING AUTHENTICATED USER</h1>}
      // onRedirectCallback={onRedirectCallback}
    >
      <Router history={history}>
        <Route component={WelcomePage} path="/" exact />
        <Route
          component={MustBeNotAuthenticated(LoginPage)}
          path="/auth/login"
        />
        <Route
          component={MustBeAuthenticated(DashboardPage)}
          path="/dashboard"
          exact
        />
      </Router>
    </TenseiAuthProvider>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
