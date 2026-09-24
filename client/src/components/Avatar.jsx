export default function Avatar({ name = 'User', size = 'md' }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const dimensions = size === 'sm' ? 'h-8 w-8 text-[10px]' : 'h-10 w-10 text-xs'
  return <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-bold text-white ${dimensions}`}>{initials}</span>
}