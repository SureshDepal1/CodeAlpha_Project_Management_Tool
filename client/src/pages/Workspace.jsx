import { useEffect, useState } from 'react'
import { Bell, CheckCircle2, ChevronDown, LayoutGrid, LogOut, Menu, Plus, Search, Users, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client.js'
import Avatar from '../components/Avatar.jsx'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import Modal from '../components/Modal.jsx'
import { useAuth } from '../hooks/useAuth.js'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} aria-hidden="true" />
}

function ProjectSkeleton() {
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div><Skeleton className="h-6 w-48" /><Skeleton className="mt-3 h-4 w-64" /></div><Skeleton className="h-7 w-20 rounded-full" /></div><div className="mt-8 grid gap-3 sm:grid-cols-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div><Skeleton className="mt-7 h-2 w-full" /></section>
}

export default function Workspace() {
  const { user, logout } = useAuth()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [isFetching, setIsFetching] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const [projectForm, setProjectForm] = useState({ title: '', description: '' })
  const [memberEmail, setMemberEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    api.get('/projects').then(({ data }) => {
      setProjects(data.projects)
      setSelectedProject(data.projects[0] || null)
    }).catch((error) => toast.error(error.response?.data?.message || 'Could not load projects.')).finally(() => setIsFetching(false))
  }, [])

  const closeModal = () => { setModal(null); setProjectForm({ title: '', description: '' }); setMemberEmail('') }
  const createProject = async (event) => {
    event.preventDefault()
    if (!projectForm.title.trim()) return
    setIsSubmitting(true)
    try {
      const { data } = await api.post('/projects', projectForm)
      setProjects((current) => [data.project, ...current]); setSelectedProject(data.project); closeModal(); toast.success('Project created.')
    } catch (error) { toast.error(error.response?.data?.message || 'Could not create project.') } finally { setIsSubmitting(false) }
  }
  const inviteMember = async (event) => {
    event.preventDefault()
    if (!selectedProject || !memberEmail.trim()) return
    setIsSubmitting(true)
    try {
      const { data } = await api.post(`/projects/${selectedProject._id}/members`, { email: memberEmail })
      setProjects((current) => current.map((project) => project._id === data.project._id ? data.project : project)); setSelectedProject(data.project); setMemberEmail(''); toast.success('Member invited.')
    } catch (error) { toast.error(error.response?.data?.message || 'Could not invite that member.') } finally { setIsSubmitting(false) }
  }

  const sidebar = <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white p-5 shadow-xl transition-transform md:shadow-none ${isSidebarOpen ? 'translate-x-0' : 'hidden md:block md:translate-x-0'}`}><div className="mb-12 flex items-center justify-between"><div className="flex items-center gap-2 text-lg font-extrabold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white"><LayoutGrid size={18} /></span> TaskFlow</div><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 md:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button></div><nav className="space-y-2 text-sm font-semibold"><div className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-3 text-indigo-700"><LayoutGrid size={17} /> Overview</div><div className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-500"><CheckCircle2 size={17} /> My tasks</div><div className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-500"><Users size={17} /> Team</div></nav><div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white"><p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Workspace pulse</p><p className="mt-3 text-2xl font-extrabold">{selectedProject ? '68%' : '--'}</p><p className="mt-1 text-xs text-indigo-100">of this week's goals are on track</p><div className="mt-4 h-1.5 rounded-full bg-white/20"><div className="h-full w-[68%] rounded-full bg-white" /></div></div></aside>

  return <main className="min-h-screen bg-[#f7f8fc] text-slate-900">{isSidebarOpen && <button className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar overlay" />}{sidebar}<section className="md:ml-72"><header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-10"><div className="flex items-center gap-3"><button className="rounded-xl border border-slate-200 p-2 text-slate-600 md:hidden" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu"><Menu size={19} /></button><div className="relative hidden w-80 sm:block"><Search className="absolute left-3 top-3 text-slate-400" size={17} /><input className="h-10 w-full rounded-xl bg-slate-50 pl-10 pr-3 text-sm outline-none ring-indigo-500/10 transition focus:ring-4" placeholder="Search your workspace" /></div></div><div className="flex items-center gap-4"><button className="text-slate-400 transition hover:text-indigo-600" aria-label="Notifications"><Bell size={19} /></button><div className="h-8 w-px bg-slate-200" /><div className="flex items-center gap-3"><Avatar name={user?.name} size="sm" /><span className="hidden text-sm font-semibold sm:block">{user?.name}</span><ChevronDown size={15} className="text-slate-400" /></div><button onClick={logout} className="text-slate-400 transition hover:text-rose-600" aria-label="Log out"><LogOut size={17} /></button></div></header><div className="p-5 md:p-10"><div className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-2 text-sm font-semibold text-indigo-600">Thursday, September 25, 2026</p><h1 className="text-4xl font-extrabold tracking-tight text-slate-950">Good morning, {user?.name?.split(' ')[0]}.</h1><p className="mt-2 text-slate-500">Here is the shape of your team's work today.</p></div><Button onClick={() => setModal('project')}><Plus size={17} /> New project</Button></div><div className="mb-6 flex flex-wrap items-center gap-2">{projects.map((project) => <button key={project._id} onClick={() => setSelectedProject(project)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedProject?._id === project._id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-indigo-200'}`}>{project.title}</button>)}</div><div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">{isFetching ? <ProjectSkeleton /> : <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-7 flex items-start justify-between gap-4"><div><h2 className="text-xl font-extrabold">{selectedProject?.title || 'Your first project'}</h2><p className="mt-1 text-sm text-slate-500">{selectedProject?.description || 'Create a project to bring your team into focus.'}</p></div><Badge tone={selectedProject ? 'green' : 'indigo'}>{selectedProject ? 'On track' : 'Get started'}</Badge></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Open tasks</p><p className="mt-2 text-3xl font-extrabold">24</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Due this week</p><p className="mt-2 text-3xl font-extrabold">08</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Team progress</p><p className="mt-2 text-3xl font-extrabold">68%</p></div></div><div className="mt-7"><div className="mb-2 flex justify-between text-xs font-semibold text-slate-500"><span>Project progress</span><span>68%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full w-[68%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" /></div></div>{selectedProject && <Button variant="secondary" className="mt-7" onClick={() => setModal('members')}><Users size={16} /> Manage members</Button>}</section>}<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Today</h2><button className="text-sm font-bold text-indigo-600">View all</button></div><div className="mt-6 space-y-5"><div><p className="text-sm font-semibold text-slate-800">Review launch brief</p><p className="mt-1 text-xs text-slate-400">Marketing launch · 10:30 AM</p></div><div><p className="text-sm font-semibold text-slate-800">Sync with product team</p><p className="mt-1 text-xs text-slate-400">Product · 2:00 PM</p></div><div><p className="text-sm font-semibold text-slate-800">Publish campaign assets</p><p className="mt-1 text-xs text-slate-400">Marketing launch · 4:30 PM</p></div></div></section></div></div></section><Modal open={modal === 'project'} title="Create a new project" onClose={closeModal}><form className="space-y-5" onSubmit={createProject}><Input label="Project name" placeholder="Website redesign" value={projectForm.title} onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })} required /><label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">Description</span><textarea className="min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" placeholder="What are you working toward?" value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} /></label><div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create project'}</Button></div></form></Modal><Modal open={modal === 'members'} title={`Manage members · ${selectedProject?.title || ''}`} onClose={closeModal}><form className="space-y-5" onSubmit={inviteMember}><Input label="Invite by email" type="email" placeholder="teammate@company.com" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} required /><Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Inviting...' : 'Send invitation'}</Button></form><div className="mt-7 border-t border-slate-100 pt-5"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Current members</p><div className="space-y-3">{selectedProject?.members?.map((member) => <div key={member.user._id || member.user} className="flex items-center gap-3"><Avatar name={member.user.name || 'Member'} size="sm" /><div><p className="text-sm font-semibold">{member.user.name || member.user.email}</p><p className="text-xs text-slate-400">{member.user.email || ''} · {member.role}</p></div></div>)}</div></div></Modal></main>
}
