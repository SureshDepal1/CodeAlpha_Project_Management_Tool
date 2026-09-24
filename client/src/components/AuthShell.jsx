import { ArrowUpRight, Layers3, Sparkles } from 'lucide-react'

export default function AuthShell({ eyebrow, title, description, children }) {
  return <main className="min-h-screen bg-white lg:grid lg:grid-cols-[1.05fr_0.95fr]">
    <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[52px] border-white/10" /><div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full border-[52px] border-violet-300/10" />
      <div className="relative"><div className="mb-20 flex items-center gap-3 text-lg font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-indigo-700 shadow-xl"><Layers3 size={21} /></span> TaskFlow</div><div className="max-w-xl"><p className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200"><Sparkles size={15} /> {eyebrow}</p><h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl">{title}</h1><p className="mt-7 max-w-md text-base leading-7 text-indigo-100">{description}</p></div></div>
      <div className="relative rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"><div className="mb-4 flex items-center justify-between text-xs text-indigo-100"><span>Weekly momentum</span><ArrowUpRight size={16} /></div><div className="flex items-end gap-1.5"><div className="h-8 w-5 rounded-t-md bg-indigo-300/60" /><div className="h-12 w-5 rounded-t-md bg-indigo-200/70" /><div className="h-16 w-5 rounded-t-md bg-white/80" /><div className="h-11 w-5 rounded-t-md bg-violet-200/70" /><div className="h-24 w-5 rounded-t-md bg-white" /><p className="ml-3 text-sm font-semibold text-white">Teams move faster together.</p></div></div>
    </section>
    <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10"><div className="w-full max-w-md">{children}</div></section>
  </main>
}