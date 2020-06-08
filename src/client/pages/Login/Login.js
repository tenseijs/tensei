import React from 'react'
import Axios from '../../helpers/axios'
import { Button } from 'office-ui-fabric-react/lib/Button'
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox'
import { TextField } from 'office-ui-fabric-react/lib/TextField'

class LoginPage extends React.Component {
  state = {
    username: '',
    password: '',
    rememberMe: false,
  }

  login = (submitEvent) => {
    submitEvent.preventDefault()

    Axios.post('login').then(console.log).catch(console.log)
  }

  render() {
    return (
      <div className="w-full bg-gray-100 h-screen">
        <div className="max-w-md mx-auto pt-20 md:px-0 px-5">
          <div className="flex justify-center mb-5">
            <img
              src="https://strapi.katifrantz.com/admin/3f6f46544e110a51499353fdc9d12bfe.png"
              className="h-10"
              alt="company-logo"
            />
          </div>
          <div className="border-t-2 border-blue-primary bg-white shadow-md py-8 px-8">
            <form onSubmit={this.login} action="">
              <TextField label="Username / Email" placeholder="john@doe.com" />
              <TextField type="password" label="Password" className="mt-4" />

              <div className="mt-8 flex justify-between items-center">
                <Checkbox label="Remember me" />

                <Button type="submit" primary>
                  Sign in
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default LoginPage
