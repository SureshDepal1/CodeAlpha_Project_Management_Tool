import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Comment task is required'],
    index: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author is required'],
    index: true,
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    minlength: [1, 'Comment text cannot be empty'],
    maxlength: [3000, 'Comment text cannot exceed 3000 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

commentSchema.index({ task: 1, createdAt: 1 });

export default mongoose.model('Comment', commentSchema);