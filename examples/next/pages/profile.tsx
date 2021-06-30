import { useAuth, mustBeAuthenticated } from '@tensei/next-auth'

export default function Profile() {
    const { user, logout } = useAuth()

    return (
        <>
            <h1>
                {user?.email}
            </h1>

            <button onClick={logout}>Logout user</button>
        </>
    )
}

export const getServerSideProps = mustBeAuthenticated()
