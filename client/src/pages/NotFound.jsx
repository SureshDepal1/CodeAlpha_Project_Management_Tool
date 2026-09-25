import { ArrowLeft, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#f7f8fc] px-5 text-slate-900"><section className="max-w-lg text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-100 text-indigo-600"><Compass size={30} /></span><p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">404 error</p><h1 className="mt-3 text-5xl font-extrabold tracking-tight text-slate-950">This page wandered off.</h1><p className="mt-4 text-slate-500">The page you are looking for does not exist or may have moved to another project.</p><Button className="mt-8" as={Link} to="/"><ArrowLeft size={16} /> Back to workspace</Button></section></main>
}
