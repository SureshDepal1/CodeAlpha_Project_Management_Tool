import { useEffect, useState } from 'react'
import { api, TOKEN_KEY } from '../api/client.js'
import { AuthContext } from './authContext.js'

const errorMessage = (error) => error.response?.data?.message || 'Something went wrong. Please try again.'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return undefined
    api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => setUser(null)).finally(() => setIsLoading(false))
    return undefined
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => setUser(null)
    window.addEventListener('taskflow:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('taskflow:unauthorized', handleUnauthorized)
  }, [])

  const authenticate = async (path, credentials) => {
    try {
      const { data } = await api.post(path, credentials)
      localStorage.setItem(TOKEN_KEY, data.token)
      setUser(data.user)
      return data
    } catch (error) { throw new Error(errorMessage(error)) }
  }

  const login = (credentials) => authenticate('/auth/login', credentials)
  const register = (credentials) => authenticate('/auth/register', credentials)
  const logout = () => { localStorage.removeItem(TOKEN_KEY); setUser(null) }

  return <AuthContext.Provider value={{ user, isLoading, isAuthenticated: Boolean(user), login, register, logout }}>{children}</AuthContext.Provider>
}

