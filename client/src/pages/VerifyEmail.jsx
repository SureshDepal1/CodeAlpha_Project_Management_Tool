import { useEffect, useState } from 'react'
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import Button from '../components/Button.jsx'
import { api } from '../api/client.js'

export default function VerifyEmail() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Confirming your email address...')

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`).then(({ data }) => {
      setMessage(data.message)
      setStatus('success')
    }).catch((error) => {
      setMessage(error.response?.data?.message || 'This verification link is invalid or has expired.')
      setStatus('error')
    })
  }, [token])

  return <AuthShell eyebrow="Account confirmed" title={<>A clearer start.<br /><span className="text-indigo-200">A calmer workday.</span></>} description="Your TaskFlow workspace is ready when you are."><div className="text-center">{status === 'loading' && <LoaderCircle className="mx-auto animate-spin text-indigo-600" size={42} />}{status === 'success' && <CheckCircle2 className="mx-auto text-emerald-500" size={46} />}{status === 'error' && <XCircle className="mx-auto text-rose-500" size={46} />}<p className="mt-6 text-sm font-semibold text-indigo-600">{status === 'loading' ? 'Verifying email' : status === 'success' ? 'Email verified' : 'Verification failed'}</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{status === 'loading' ? 'One moment' : status === 'success' ? 'You are all set' : 'We could not verify that link'}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>{status === 'success' && <Button className="mt-8 w-full" as={Link} to="/login">Continue to sign in</Button>}{status === 'error' && <Button className="mt-8 w-full" variant="secondary" as={Link} to="/check-email">Request a new link</Button>}</div></AuthShell>
}
