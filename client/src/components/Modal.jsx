import { X } from 'lucide-react'

export default function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" onMouseDown={onClose}><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">{title}</h2><button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={onClose} aria-label="Close"><X size={18} /></button></div>{children}</div></div>
}