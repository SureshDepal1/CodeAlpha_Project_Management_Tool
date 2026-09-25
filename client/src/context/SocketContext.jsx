import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { api, TOKEN_KEY } from '../api/client.js'
import { useAuth } from '../hooks/useAuth.js'

const SocketContext = createContext(null)
const socketUrl = import.meta.env.VITE_SOCKET_URL || api.defaults.baseURL.replace(/\/api\/?$/, '')

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) {
      setSocket(null)
      setNotifications([])
      setUnreadCount(0)
      return undefined
    }

    let active = true
    const token = localStorage.getItem(TOKEN_KEY)
    const connection = io(socketUrl, { auth: { token } })
    setSocket(connection)
    api.get('/notifications').then(({ data }) => {
      if (active) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    }).catch(() => {})

    const handleNotification = (notification) => {
      setNotifications((current) => [notification, ...current.filter((item) => item._id !== notification._id)])
      setUnreadCount((current) => current + (notification.isRead ? 0 : 1))
      toast(notification.message, { icon: '🔔' })
    }
    connection.on('notification:new', handleNotification)
    return () => {
      active = false
      connection.off('notification:new', handleNotification)
      connection.disconnect()
      setSocket(null)
    }
  }, [user])

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      setNotifications((current) => current.map((notification) => notification._id === notificationId ? { ...notification, isRead: true } : notification))
      setUnreadCount((current) => Math.max(0, current - 1))
    } catch { toast.error('Could not update notification.') }
  }

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })))
      setUnreadCount(0)
    } catch { toast.error('Could not mark notifications as read.') }
  }

  return <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, markAllAsRead }}>{children}</SocketContext.Provider>
}

export const useSocket = () => useContext(SocketContext)
