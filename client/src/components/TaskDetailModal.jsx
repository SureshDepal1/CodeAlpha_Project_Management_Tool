import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, Clock3, MessageCircle, Send, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client.js'
import Avatar from './Avatar.jsx'
import Badge from './Badge.jsx'
import Button from './Button.jsx'
import Modal from './Modal.jsx'
import { useSocket } from '../context/SocketContext.jsx'

const priorityTone = { low: 'green', medium: 'indigo', high: 'amber' }
const priorityLabel = { low: 'Low', medium: 'Medium', high: 'High' }

const formatDateInput = (date) => (date ? new Date(date).toISOString().slice(0, 10) : '')

const formatRelativeTime = (date) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export default function TaskDetailModal({ task, members, onClose, onTaskUpdated }) {
  const { socket } = useSocket()
  const taskId = task?._id
  const [draft, setDraft] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!task) return
    setDraft({ title: task.title, description: task.description || '', priority: task.priority, dueDate: formatDateInput(task.dueDate), assignee: task.assignee?._id || '' })
    setCommentText('')
    setLoadError('')
    setIsLoading(true)
    api.get(`/tasks/${task._id}/comments`).then(({ data }) => setComments(data.comments)).catch((error) => setLoadError(error.response?.data?.message || 'We could not load the activity yet.')).finally(() => setIsLoading(false))
  }, [task])

  useEffect(() => {
    if (!socket || !taskId) return undefined
    const handleCommentCreated = ({ taskId: eventTaskId, comment }) => {
      if (eventTaskId !== taskId) return
      setComments((current) => current.some((item) => item._id === comment._id) ? current : [...current, comment])
    }
    const handleCommentDeleted = ({ taskId: eventTaskId, commentId }) => {
      if (eventTaskId === taskId) setComments((current) => current.filter((comment) => comment._id !== commentId))
    }
    socket.on('comment:created', handleCommentCreated)
    socket.on('comment:deleted', handleCommentDeleted)
    return () => {
      socket.off('comment:created', handleCommentCreated)
      socket.off('comment:deleted', handleCommentDeleted)
    }
  }, [socket, taskId])

  const hasChanges = useMemo(() => draft && (draft.title !== task?.title || draft.description !== (task?.description || '') || draft.priority !== task?.priority || draft.dueDate !== formatDateInput(task?.dueDate) || draft.assignee !== (task?.assignee?._id || '')), [draft, task])

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }))

  const saveTask = async (event) => {
    event.preventDefault()
    if (!draft.title.trim()) return
    setIsSaving(true)
    try {
      const { data } = await api.patch(`/tasks/${task._id}`, { title: draft.title.trim(), description: draft.description.trim(), priority: draft.priority, dueDate: draft.dueDate || null, assignee: draft.assignee || null })
      onTaskUpdated(data.task)
      toast.success('Task details saved.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save task details.')
    } finally { setIsSaving(false) }
  }

  const addComment = async (event) => {
    event.preventDefault()
    if (!commentText.trim()) return
    setIsCommenting(true)
    try {
      const { data } = await api.post(`/tasks/${task._id}/comments`, { text: commentText.trim() })
      setComments((current) => [...current, data.comment])
      onTaskUpdated({ ...task, commentCount: (task.commentCount || 0) + 1 })
      setCommentText('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not add comment.')
    } finally { setIsCommenting(false) }
  }

  const deleteComment = async (comment) => {
    setDeletingCommentId(comment._id)
    try {
      await api.delete(`/tasks/${task._id}/comments/${comment._id}`)
      setComments((current) => current.filter((item) => item._id !== comment._id))
      onTaskUpdated({ ...task, commentCount: Math.max(0, (task.commentCount || 0) - 1) })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete comment.')
    } finally { setDeletingCommentId(null) }
  }

  return <Modal open={Boolean(task)} title="Task details" onClose={onClose} maxWidth="max-w-5xl">
    {!draft ? <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">Preparing task details...</div> : <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,.95fr)]">
      <form onSubmit={saveTask} className="space-y-5">
        <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="task-title">Task title</label><input id="task-title" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10" value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} /></div>
        <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="task-description">Description</label><textarea id="task-description" className="min-h-36 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10" placeholder="Add context for your team..." value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Assignee</span><select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400" value={draft.assignee} onChange={(event) => updateDraft('assignee', event.target.value)}><option value="">Unassigned</option>{members.map((member) => <option key={member._id} value={member._id}>{member.name}</option>)}</select></label>
          <label className="block text-sm font-medium text-slate-700"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Priority</span><select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400" value={draft.priority} onChange={(event) => updateDraft('priority', event.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
        </div>
        <label className="block text-sm font-medium text-slate-700"><span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><CalendarDays size={14} /> Due date</span><input type="date" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400" value={draft.dueDate} onChange={(event) => updateDraft('dueDate', event.target.value)} /></label>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4"><Badge tone={priorityTone[draft.priority]}>{priorityLabel[draft.priority]}</Badge><Button type="submit" disabled={isSaving || !draft.title.trim() || !hasChanges}>{isSaving ? 'Saving...' : <><Check size={16} /> Save changes</>}</Button></div>
      </form>
      <section className="border-t border-slate-100 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0" aria-label="Task activity"><div className="mb-4 flex items-center justify-between"><div><h3 className="flex items-center gap-2 font-bold text-slate-900"><MessageCircle size={17} className="text-indigo-500" /> Activity</h3><p className="mt-1 text-xs text-slate-400">{comments.length} comment{comments.length === 1 ? '' : 's'}</p></div><Clock3 size={18} className="text-slate-300" /></div>
        {isLoading ? <div className="space-y-3"><div className="h-16 animate-pulse rounded-xl bg-slate-100" /><div className="h-16 animate-pulse rounded-xl bg-slate-100" /></div> : loadError ? <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{loadError}</div> : <div className="max-h-72 space-y-4 overflow-y-auto pr-1">{comments.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-400">No comments yet. Start the conversation.</div> : comments.map((comment) => <article key={comment._id} className="flex gap-3"><Avatar name={comment.author?.name} size="sm" /><div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2.5"><div className="flex items-center gap-2"><p className="text-xs font-bold text-slate-800">{comment.author?.name || 'Teammate'}</p><span className="text-[11px] text-slate-400">{formatRelativeTime(comment.createdAt)}</span><button type="button" onClick={() => deleteComment(comment)} disabled={deletingCommentId === comment._id} className="ml-auto rounded p-1 text-slate-300 transition hover:bg-white hover:text-rose-500 disabled:opacity-50" aria-label="Delete comment"><Trash2 size={13} /></button></div><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-slate-600">{comment.text}</p></div></article>)}</div>}
        <form onSubmit={addComment} className="mt-5 flex gap-2 border-t border-slate-100 pt-4"><input className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400" placeholder="Write a comment..." value={commentText} onChange={(event) => setCommentText(event.target.value)} disabled={isCommenting} /><Button type="submit" className="min-h-10 px-3" disabled={isCommenting || !commentText.trim()} aria-label="Add comment">{isCommenting ? '...' : <Send size={15} />}</Button></form>
      </section>
    </div>}
  </Modal>
}
