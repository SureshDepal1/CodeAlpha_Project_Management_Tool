export default function Badge({ children, tone = 'indigo' }) {
  const tones = { indigo: 'bg-indigo-50 text-indigo-700', green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700' }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>{children}</span>
}