import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from '../components/AuthShell.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function Login() {
  const { login } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' }); const [errors, setErrors] = useState({}); const [isSubmitting, setIsSubmitting] = useState(false)
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async (event) => { event.preventDefault(); const next = {}; if (!form.email.includes('@')) next.email = 'Enter a valid email address.'; if (form.password.length < 8) next.password = 'Use at least 8 characters.'; setErrors(next); if (Object.keys(next).length) return; setIsSubmitting(true); try { await login(form); toast.success('Welcome back.'); navigate(location.state?.from?.pathname || '/', { replace: true }) } catch (error) { toast.error(error.message) } finally { setIsSubmitting(false) } }
  return <AuthShell eyebrow="A calmer way to work" title={<>Make progress visible.<br /><span className="text-indigo-200">Make work matter.</span></>} description="Bring projects, people, and momentum into one focused workspace."><div><p className="mb-3 text-sm font-semibold text-indigo-600">Welcome back</p><h2 className="text-3xl font-extrabold tracking-tight text-slate-950">Sign in to TaskFlow</h2><p className="mt-2 text-sm text-slate-500">Pick up where your team left off.</p><form className="mt-8 space-y-5" onSubmit={submit}><Input label="Email address" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={update} error={errors.email} /><Input label="Password" name="password" type="password" autoComplete="current-password" placeholder="Your password" value={form.password} onChange={update} error={errors.password} /><Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing you in...' : 'Sign in'}</Button></form><p className="mt-8 text-center text-sm text-slate-500">New to TaskFlow? <Link className="font-bold text-indigo-600 hover:text-indigo-700" to="/register">Create an account</Link></p></div></AuthShell>
}