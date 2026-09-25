import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import Project from '../models/Project.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'

let io

const userRoom = (userId) => `user:${userId}`
export const projectRoom = (projectId) => `project:${projectId}`

const isProjectMember = (project, userId) => project && (project.owner.equals(userId) || project.members.some(({ user }) => user.equals(userId)))

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' },
  })

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Authentication required'))
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId)
      if (!user) return next(new Error('User account no longer exists'))
      socket.user = user
      return next()
    } catch (_error) {
      return next(new Error('Invalid authentication token'))
    }
  })

  io.on('connection', (socket) => {
    socket.join(userRoom(socket.user._id))
    socket.on('project:join', async (projectId) => {
      const project = await Project.findById(projectId).select('owner members')
      if (isProjectMember(project, socket.user._id)) socket.join(projectRoom(projectId))
    })
    socket.on('project:leave', (projectId) => socket.leave(projectRoom(projectId)))
  })

  return io
}

export const emitToProject = (projectId, event, payload) => {
  if (io) io.to(projectRoom(projectId)).emit(event, payload)
}

export const emitToUser = (userId, event, payload) => {
  if (io) io.to(userRoom(userId)).emit(event, payload)
}

export const createNotification = async ({ recipient, type, message, link = '' }) => {
  const notification = await Notification.create({ recipient, type, message, link })
  const payload = notification.toObject()
  emitToUser(recipient, 'notification:new', payload)
  return payload
}
