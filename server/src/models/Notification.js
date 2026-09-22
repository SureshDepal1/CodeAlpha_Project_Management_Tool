import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification recipient is required'],
    index: true,
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    trim: true,
    lowercase: true,
    maxlength: [50, 'Notification type cannot exceed 50 characters'],
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Notification message cannot exceed 500 characters'],
  },
  link: {
    type: String,
    trim: true,
    maxlength: [500, 'Notification link cannot exceed 500 characters'],
    default: '',
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);