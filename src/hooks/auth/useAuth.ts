import { useState, useEffect } from 'react'

interface Credentials {
    username: string;
    password: string;
}

const useAuth = () => {
    const [ user, _setUser ] = useState(null)

    useEffect(() => {
        // Logic to check user authentication status
    }, [])

    const login = (_credentials: Credentials) => {
        // Logic to log in the user
    }

    const logout = () => {
        // Logic to log out the user
    }

    return { user, login, logout }
}

export default useAuth 