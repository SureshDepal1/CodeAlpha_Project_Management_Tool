import { useEffect, useState } from 'react'
import { CalendarDays, ChevronDown, LogOut, Menu, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client.js'
import Avatar from '../components/Avatar.jsx'
import Badge from '../components/Badge.jsx'
import Sidebar from '../components/Sidebar.jsx'
import TaskDetailModal from '../components/TaskDetailModal.jsx'
import { Bell } from '../components/NotificationBell.jsx'
import { useAuth } from '../hooks/useAuth.js'

const priorityTone = { low: 'green', medium: 'indigo', high: 'amber' }

export default function MyTasks() {
  const { user, logout } = useAuth()
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  useEffect(() => { api.get('/tasks/mine').then(({ data }) => setTasks(data.tasks)).catch((error) => toast.error(error.response?.data?.message || 'Could not load your tasks.')) }, [])
  const updateTask = (task) => { setTasks((current) => current.map((item) => item._id === task._id ? { ...item, ...task } : item)); setSelectedTask((current) => current?._id === task._id ? { ...current, ...task } : current) }
  const deleteTask = (taskId) => setTasks((current) => current.filter((item) => item._id !== taskId))
  const members = selectedTask?.project ? [selectedTask.project.owner, ...(selectedTask.project.members || []).map((member) => member.user)].filter(Boolean) : []
  return <main className="min-h-screen bg-[#f7f8fc] text-slate-900"><Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} /><section className="md:ml-72"><header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-10"><div className="flex items-center gap-3"><button className="rounded-xl border border-slate-200 p-2 text-slate-600 md:hidden" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu"><Menu size={19} /></button><div className="relative hidden w-80 sm:block"><Search className="absolute left-3 top-3 text-slate-400" size={17} /><input className="h-10 w-full rounded-xl bg-slate-50 pl-10 pr-3 text-sm outline-none" placeholder="Search your tasks" /></div></div><div className="flex items-center gap-4"><Bell size={19} className="text-slate-400" /><div className="h-8 w-px bg-slate-200" /><Avatar name={user?.name} size="sm" /><span className="hidden text-sm font-semibold sm:block">{user?.name}</span><ChevronDown size={15} className="text-slate-400" /><button onClick={logout} className="text-slate-400 hover:text-rose-600" aria-label="Log out"><LogOut size={17} /></button></div></header><div className="p-5 md:p-10"><div className="mb-8"><p className="mb-2 text-sm font-semibold text-indigo-600">Your queue</p><h1 className="text-4xl font-extrabold tracking-tight text-slate-950">My tasks</h1><p className="mt-2 text-slate-500">Everything assigned to you across your projects.</p></div>{tasks.length === 0 ? <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">No tasks assigned to you yet.</section> : <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-100">{tasks.map((task) => <button key={task._id} onClick={() => setSelectedTask(task)} className="flex w-full flex-wrap items-center gap-4 px-5 py-5 text-left transition hover:bg-slate-50 md:px-6"><div className="min-w-0 flex-1"><p className="font-bold text-slate-800">{task.title}</p><p className="mt-1 line-clamp-1 text-sm text-slate-500">{task.description || 'No description'}</p></div><span className="text-sm font-semibold text-slate-500">{task.project?.title}</span><Badge tone={priorityTone[task.priority] || 'indigo'}>{task.column?.title || 'Unknown'}</Badge><span className="text-xs font-semibold capitalize text-slate-500">{task.priority}</span>{task.dueDate && <span className="flex items-center gap-1 text-xs text-slate-400"><CalendarDays size={14} />{new Date(task.dueDate).toLocaleDateString()}</span>}</button>)}</div></section>}</div></section><TaskDetailModal task={selectedTask} members={members} onClose={() => setSelectedTask(null)} onTaskUpdated={updateTask} onTaskDeleted={deleteTask} /></main>
}