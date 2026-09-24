import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Workspace from './pages/Workspace.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  const { isLoading } = useAuth()
  if (isLoading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Loading your workspace...</div>
  return <Routes><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route element={<ProtectedRoute />}><Route path="/" element={<Workspace />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>
}

export default App
