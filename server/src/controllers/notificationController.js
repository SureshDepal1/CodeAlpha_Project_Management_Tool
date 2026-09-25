import Notification from '../models/Notification.js'

export const listNotifications = async (req, res) => {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(40),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ])
  return res.status(200).json({ notifications, unreadCount })
}

export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true },
  )
  if (!notification) {
    const error = new Error('Notification not found')
    error.statusCode = 404
    error.code = 'NOTIFICATION_NOT_FOUND'
    throw error
  }
  return res.status(200).json({ notification })
}

export const markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true })
  return res.status(204).send()
}
