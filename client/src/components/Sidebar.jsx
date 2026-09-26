import { CheckCircle2, LayoutGrid, Users, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { label: 'Overview', to: '/', icon: LayoutGrid, end: true },
  { label: 'My tasks', to: '/tasks', icon: CheckCircle2 },
  { label: 'Team', to: '/team', icon: Users },
]

export default function Sidebar({ pulse = null, isOpen = false, onClose }) {
  return <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white p-5 shadow-xl transition-transform md:shadow-none ${isOpen ? 'translate-x-0' : 'hidden md:block md:translate-x-0'}`}>
    <div className="mb-12 flex items-center justify-between">
      <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white"><LayoutGrid size={18} /></span> TaskFlow</div>
      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 md:hidden" onClick={onClose} aria-label="Close menu"><X size={18} /></button>
    </div>
    <nav className="space-y-2 text-sm font-semibold">
      {links.map(({ label, to, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}><Icon size={17} /> {label}</NavLink>)}
    </nav>
    <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Workspace pulse</p>
      <p className="mt-3 text-2xl font-extrabold">{pulse === null ? '--' : `${pulse}%`}</p>
      <p className="mt-1 text-xs text-indigo-100">of this week's goals are on track</p>
      <div className="mt-4 h-1.5 rounded-full bg-white/20"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${pulse || 0}%` }} /></div>
    </div>
  </aside>
}