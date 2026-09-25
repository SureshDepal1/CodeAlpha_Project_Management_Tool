import { useState } from 'react'
import { Check, Mail, RefreshCw } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from '../components/AuthShell.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import { api } from '../api/client.js'

export default function CheckEmail() {
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const resend = async (event) => {
    event.preventDefault()
    if (!email.trim()) return
    setIsSending(true)
    try {
      await api.post('/auth/resend-verification', { email: email.trim() })
      setSent(true)
      toast.success('Verification email requested.')
    } catch (error) { toast.error(error.response?.data?.message || 'Could not resend verification email.') } finally { setIsSending(false) }
  }

  return <AuthShell eyebrow="One small step" title={<>Check your inbox.<br /><span className="text-indigo-200">Then get to work.</span></>} description="We sent a secure verification link to your email address. It is valid for one hour."><div className="text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-100 text-indigo-600"><Mail size={25} /></span><p className="mt-6 text-sm font-semibold text-indigo-600">Verification needed</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Check your email</h2><p className="mt-3 text-sm leading-6 text-slate-500">Open the link in your inbox to confirm your address before signing in.</p><form className="mt-7 space-y-4 text-left" onSubmit={resend}><Input label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required /><Button className="w-full" type="submit" disabled={isSending}>{isSending ? 'Sending...' : <><RefreshCw size={16} /> Resend verification email</>}</Button></form>{sent && <p className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600"><Check size={14} /> If the account needs verification, a new email is on its way.</p>}<p className="mt-7 text-sm text-slate-500"><Link className="font-bold text-indigo-600 hover:text-indigo-700" to="/login">Back to sign in</Link></p></div></AuthShell>
}
