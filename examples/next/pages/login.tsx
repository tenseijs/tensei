import { useAuth, redirectIfAuthenticated, tensei } from '@tensei/next-auth'

export default function Login() {
    const { setAuth } = useAuth()

    const login = () => {
        fetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'bahdcoder+15@gmail.com',
            password: 'password',
            accepted_terms_and_conditions: true
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => response.json())
        .then(data => {
          setAuth(data)
        })
      }

    return (
        <>
          <button onClick={login}>Login here</button>
          <br />
          <a href={tensei.auth().socialRedirectUrl('google')}>Login with google</a>
        </>
    )
}

export const getServerSideProps = redirectIfAuthenticated()
