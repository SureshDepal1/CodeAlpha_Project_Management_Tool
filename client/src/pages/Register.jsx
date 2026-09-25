import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from '../components/AuthShell.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function Register() {
  const { register } = useAuth(); const navigate = useNavigate(); const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' }); const [errors, setErrors] = useState({})
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async (event) => { event.preventDefault(); const next = {}; if (form.name.trim().length < 2) next.name = 'Tell us your name.'; if (!form.email.includes('@')) next.email = 'Enter a valid email address.'; if (form.password.length < 8) next.password = 'Use at least 8 characters.'; setErrors(next); if (Object.keys(next).length) return; setIsSubmitting(true); try { await register(form); toast.success('Verification email sent.'); navigate('/check-email', { replace: true, state: { email: form.email } }) } catch (error) { toast.error(error.message) } finally { setIsSubmitting(false) } }
  return <AuthShell eyebrow="Start with clarity" title={<>The workday,<br /><span className="text-indigo-200">in focus.</span></>} description="Create a shared home for your team's next meaningful project."><div><p className="mb-3 text-sm font-semibold text-indigo-600">Create your account</p><h2 className="text-3xl font-extrabold tracking-tight text-slate-950">Join TaskFlow</h2><p className="mt-2 text-sm text-slate-500">A clear space for ambitious teams.</p><form className="mt-8 space-y-5" onSubmit={submit}><Input label="Full name" name="name" autoComplete="name" placeholder="Jordan Davis" value={form.name} onChange={update} error={errors.name} /><Input label="Work email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={update} error={errors.email} /><Input label="Password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={update} error={errors.password} /><Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating your account...' : 'Create account'}</Button></form><p className="mt-8 text-center text-sm text-slate-500">Already have an account? <Link className="font-bold text-indigo-600 hover:text-indigo-700" to="/login">Sign in</Link></p></div></AuthShell>
}