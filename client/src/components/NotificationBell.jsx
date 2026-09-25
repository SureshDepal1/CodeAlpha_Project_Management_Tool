import { useState } from 'react'
import { Bell as BellIcon, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext.jsx'

const formatTime = (date) => {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket()
  const [isOpen, setIsOpen] = useState(false)

  const openNotification = async (notification) => {
    if (!notification.isRead) await markAsRead(notification._id)
    setIsOpen(false)
    if (notification.link) navigate(notification.link)
  }

  return <div className="relative">
    <button onClick={() => setIsOpen((current) => !current)} className="relative rounded-lg p-1 text-slate-400 transition hover:text-indigo-600" aria-label="Notifications" aria-expanded={isOpen}><BellIcon size={19} />{unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}</button>
    {isOpen && <div className="absolute right-0 top-10 z-30 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h2 className="text-sm font-bold text-slate-900">Notifications</h2><p className="text-xs text-slate-400">{unreadCount ? `${unreadCount} unread` : 'All caught up'}</p></div><button onClick={markAllAsRead} disabled={!unreadCount} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 disabled:text-slate-300"><CheckCheck size={14} /> Mark all read</button></div><div className="max-h-80 overflow-y-auto">{notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet.</p> : notifications.map((notification) => <button key={notification._id} onClick={() => openNotification(notification)} className={`block w-full border-b border-slate-50 px-4 py-3 text-left transition hover:bg-indigo-50/50 ${notification.isRead ? 'bg-white' : 'bg-indigo-50/40'}`}><div className="flex gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? 'bg-slate-200' : 'bg-indigo-500'}`} /><div className="min-w-0 flex-1"><p className="text-sm leading-5 text-slate-700">{notification.message}</p><p className="mt-1 text-[11px] font-semibold text-slate-400">{formatTime(notification.createdAt)}</p></div></div></button>)}</div></div>}
  </div>
}

export const Bell = NotificationBell
