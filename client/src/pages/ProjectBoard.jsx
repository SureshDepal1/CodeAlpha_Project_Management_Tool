import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, GripVertical, MessageCircle, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import Avatar from '../components/Avatar.jsx'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import TaskDetailModal from '../components/TaskDetailModal.jsx'
import { useSocket } from '../context/SocketContext.jsx'
import { useAuth } from '../hooks/useAuth.js'

const priorityTone = { low: 'green', medium: 'indigo', high: 'amber' }
const priorityLabel = { low: 'Low', medium: 'Medium', high: 'High' }

function TaskCard({ task, index, onOpen }) {
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(task)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onOpen(task) }}
          className={`group rounded-2xl border bg-white p-4 shadow-sm transition duration-200 ${snapshot.isDragging ? 'rotate-2 border-indigo-300 shadow-2xl shadow-indigo-950/20' : 'border-slate-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-950/5'}`}
        >
          <div className="flex items-start gap-2">
            <GripVertical className="mt-0.5 shrink-0 text-slate-300 transition group-hover:text-indigo-400" size={16} />
            <p className="min-w-0 flex-1 text-sm font-bold leading-5 text-slate-800">{task.title}</p>
            <Badge tone={priorityTone[task.priority] || 'indigo'}>{priorityLabel[task.priority] || task.priority}</Badge>
          </div>
          {task.description && <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{task.description}</p>}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {task.dueDate && <span className="flex items-center gap-1"><CalendarDays size={13} />{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
              <span className="flex items-center gap-1"><MessageCircle size={13} />{task.commentCount || 0}</span>
            </div>
            {task.assignee ? <Avatar name={task.assignee.name} size="sm" /> : <span className="grid h-8 w-8 place-items-center rounded-full border border-dashed border-slate-300 text-slate-300"><Users size={13} /></span>}
          </div>
        </article>
      )}
    </Draggable>
  )
}

function ColumnSkeleton() {
  return <div className="w-[310px] shrink-0 rounded-2xl bg-slate-100 p-3"><div className="h-6 w-32 animate-pulse rounded bg-slate-200" /><div className="mt-4 h-32 animate-pulse rounded-2xl bg-slate-200" /><div className="mt-3 h-28 animate-pulse rounded-2xl bg-slate-200" /></div>
}

export default function ProjectBoard() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [columns, setColumns] = useState([])
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState('all')
  const [assignee, setAssignee] = useState('all')
  const [newTaskColumn, setNewTaskColumn] = useState(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [showColumnForm, setShowColumnForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/projects/${projectId}/columns`),
      api.get(`/projects/${projectId}/tasks`),
    ]).then(([projectResponse, columnsResponse, tasksResponse]) => {
      setProject(projectResponse.data.project)
      setColumns(columnsResponse.data.columns)
      setTasks(tasksResponse.data.tasks)
    }).catch((error) => toast.error(error.response?.data?.message || 'Could not load the project board.')).finally(() => setIsLoading(false))
  }, [projectId])

  useEffect(() => {
    if (!socket || !projectId) return undefined
    socket.emit('project:join', projectId)
    const updateTaskFromSocket = ({ task, tasks: incomingTasks }) => {
      const updates = incomingTasks || [task]
      setTasks((current) => updates.reduce((next, update) => next.some((item) => item._id === update._id) ? next.map((item) => item._id === update._id ? { ...item, ...update } : item) : [...next, update], current))
    }
    const updateCommentCount = ({ taskId, amount, actorId }) => {
      if (actorId === user?.id) return
      setTasks((current) => current.map((task) => task._id === taskId ? { ...task, commentCount: Math.max(0, (task.commentCount || 0) + amount) } : task))
    }
    const updateProject = ({ project: updatedProject }) => setProject(updatedProject)
    const handleCommentCreated = (payload) => updateCommentCount({ ...payload, amount: 1 })
    const handleCommentDeleted = (payload) => updateCommentCount({ ...payload, amount: -1 })
    socket.on('task:created', updateTaskFromSocket)
    socket.on('task:updated', updateTaskFromSocket)
    socket.on('task:moved', updateTaskFromSocket)
    socket.on('comment:created', handleCommentCreated)
    socket.on('comment:deleted', handleCommentDeleted)
    socket.on('project:member-added', updateProject)
    return () => {
      socket.emit('project:leave', projectId)
      socket.off('task:created', updateTaskFromSocket)
      socket.off('task:updated', updateTaskFromSocket)
      socket.off('task:moved', updateTaskFromSocket)
      socket.off('comment:created', handleCommentCreated)
      socket.off('comment:deleted', handleCommentDeleted)
      socket.off('project:member-added', updateProject)
    }
  }, [socket, projectId, user?.id])

  const projectMembers = useMemo(() => {
    if (!project) return []
    const members = [project.owner, ...(project.members || []).map((member) => member.user)]
    return members.filter(Boolean).filter((member, index, all) => all.findIndex((item) => item._id === member._id) === index)
  }, [project])
  const assignees = projectMembers
  const visibleTasks = useMemo(() => tasks.filter((task) => task.title.toLowerCase().includes(query.toLowerCase()) && (priority === 'all' || task.priority === priority) && (assignee === 'all' || task.assignee?._id === assignee)), [tasks, query, priority, assignee])
  const tasksForColumn = (columnId) => visibleTasks.filter((task) => task.column === columnId).sort((first, second) => first.order - second.order)

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return
    const previousTasks = tasks
    const nextTasks = previousTasks.map((task) => {
      if (task._id === draggableId) return { ...task, column: destination.droppableId, order: destination.index }
      if (task.column === source.droppableId && task.order > source.index) return { ...task, order: task.order - 1 }
      if (task.column === destination.droppableId && task._id !== draggableId && task.order >= destination.index) return { ...task, order: task.order + 1 }
      return task
    })
    setTasks(nextTasks)
    try {
      await api.patch(`/tasks/${draggableId}/move`, { column: destination.droppableId, order: destination.index })
      toast.success('Task moved.', { id: 'task-moved', duration: 1400 })
    } catch (error) {
      setTasks(previousTasks)
      toast.error(error.response?.data?.message || 'Could not move task.')
    }
  }

  const addTask = async (event, columnId) => {
    event.preventDefault()
    if (!newTaskTitle.trim()) return
    try {
      const { data } = await api.post(`/projects/${projectId}/tasks`, { title: newTaskTitle.trim(), column: columnId, priority: 'medium' })
      setTasks((current) => current.some((task) => task._id === data.task._id) ? current : [...current, data.task])
      setNewTaskTitle('')
      setNewTaskColumn(null)
      toast.success('Task added.')
    } catch (error) { toast.error(error.response?.data?.message || 'Could not add task.') }
  }

  const addColumn = async (event) => {
    event.preventDefault()
    if (!newColumnTitle.trim()) return
    try {
      const { data } = await api.post(`/projects/${projectId}/columns`, { title: newColumnTitle.trim(), order: columns.length })
      setColumns((current) => [...current, data.column])
      setNewColumnTitle('')
      setShowColumnForm(false)
      toast.success('Column added.')
    } catch (error) { toast.error(error.response?.data?.message || 'Could not add column.') }
  }

  const updateTask = (updatedTask) => {
    setTasks((current) => current.map((task) => task._id === updatedTask._id ? { ...task, ...updatedTask } : task))
    setSelectedTask((current) => current?._id === updatedTask._id ? { ...current, ...updatedTask } : current)
  }

  const renameColumn = async (column) => {
    const title = window.prompt('Rename column', column.title)
    if (!title?.trim() || title.trim() === column.title) return
    try {
      const { data } = await api.patch(`/columns/${column._id}`, { title: title.trim() })
      setColumns((current) => current.map((item) => item._id === column._id ? data.column : item))
      toast.success('Column renamed.')
    } catch (error) { toast.error(error.response?.data?.message || 'Could not rename column.') }
  }

  const deleteColumn = async (column) => {
    if (tasks.some((task) => task.column === column._id)) { toast.error('Move or delete the tasks before deleting this column.'); return }
    if (!window.confirm(`Delete ${column.title}?`)) return
    try {
      await api.delete(`/columns/${column._id}`)
      setColumns((current) => current.filter((item) => item._id !== column._id))
      toast.success('Column deleted.')
    } catch (error) { toast.error(error.response?.data?.message || 'Could not delete column.') }
  }

  return <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-4 px-5 py-4 md:px-8">
        <button onClick={() => navigate('/')} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Back to workspace"><ArrowLeft size={19} /></button>
        <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Project board</p><h1 className="truncate text-xl font-extrabold tracking-tight">{project?.title || 'Loading project...'}</h1></div>
        {project && <Button variant="secondary" onClick={() => navigate('/')}><Users size={16} /> Members</Button>}
      </div>
      <div className="mx-auto flex max-w-[1800px] flex-wrap gap-3 px-5 pb-4 md:px-8">
        <label className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-2.5 text-slate-400" size={16} /><input className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10" placeholder="Search tasks..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-indigo-400" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="all">All priorities</option><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option></select>
        <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-indigo-400" value={assignee} onChange={(event) => setAssignee(event.target.value)}><option value="all">All assignees</option>{assignees.map((member) => <option key={member._id} value={member._id}>{member.name}</option>)}</select>
      </div>
    </header>
    <section className="mx-auto max-w-[1800px] overflow-x-auto px-5 py-6 md:px-8">
      <DragDropContext onDragEnd={onDragEnd}><div className="flex min-h-[calc(100vh-190px)] items-start gap-5 pb-5">
        {isLoading ? [1, 2, 3].map((item) => <ColumnSkeleton key={item} />) : columns.map((column) => <Droppable droppableId={column._id} key={column._id}>{(provided) => <div ref={provided.innerRef} {...provided.droppableProps} className="w-[310px] shrink-0 rounded-2xl bg-slate-100/90 p-3"><div className="mb-3 flex items-center gap-2 px-2"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /><h2 className="flex-1 text-sm font-extrabold">{column.title}</h2><span className="text-xs font-bold text-slate-400">{tasksForColumn(column._id).length}</span><button onClick={() => renameColumn(column)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-indigo-600" aria-label={`Rename ${column.title}`}><Pencil size={14} /></button><button onClick={() => deleteColumn(column)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-rose-600" aria-label={`Delete ${column.title}`}><Trash2 size={14} /></button></div><div className="min-h-24 space-y-3">{tasksForColumn(column._id).map((task, index) => <TaskCard key={task._id} task={task} index={index} onOpen={setSelectedTask} />)}{provided.placeholder}</div>{newTaskColumn === column._id ? <form className="mt-3 rounded-xl bg-white p-3 shadow-sm" onSubmit={(event) => addTask(event, column._id)}><input autoFocus className="w-full text-sm outline-none" placeholder="Task title..." value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} /><div className="mt-3 flex gap-2"><Button className="min-h-9 px-3 text-xs" type="submit">Add task</Button><Button className="min-h-9 px-3 text-xs" type="button" variant="ghost" onClick={() => setNewTaskColumn(null)}>Cancel</Button></div></form> : <button onClick={() => setNewTaskColumn(column._id)} className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-indigo-600"><Plus size={16} /> Add task</button>}</div>}</Droppable>)}
        <div className="w-[270px] shrink-0">{showColumnForm ? <form className="rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 p-4" onSubmit={addColumn}><Input label="New column" placeholder="Review" value={newColumnTitle} onChange={(event) => setNewColumnTitle(event.target.value)} autoFocus /><div className="mt-3 flex gap-2"><Button className="min-h-9 px-3 text-xs" type="submit">Add</Button><Button className="min-h-9 px-3 text-xs" type="button" variant="ghost" onClick={() => setShowColumnForm(false)}>Cancel</Button></div></form> : <button onClick={() => setShowColumnForm(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm font-bold text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"><Plus size={17} /> Add column</button>}</div>
      </div></DragDropContext>
    </section>
    <TaskDetailModal task={selectedTask} members={projectMembers} onClose={() => setSelectedTask(null)} onTaskUpdated={updateTask} />
  </main>
}
