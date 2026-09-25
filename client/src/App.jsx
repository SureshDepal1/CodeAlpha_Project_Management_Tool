import { Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Workspace from './pages/Workspace.jsx'
import ProjectBoard from './pages/ProjectBoard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import NotFound from './pages/NotFound.jsx'
import PageTransition from './components/PageTransition.jsx'

function App() {
  const { isLoading } = useAuth()
  if (isLoading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Loading your workspace...</div>
  return <PageTransition><Routes><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route element={<ProtectedRoute />}><Route path="/" element={<Workspace />} /><Route path="/projects/:projectId/board" element={<ProjectBoard />} /></Route><Route path="*" element={<NotFound />} /></Routes></PageTransition>
}

export default App
