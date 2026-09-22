import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [1, 'Task title cannot be empty'],
    maxlength: [160, 'Task title cannot exceed 160 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Task description cannot exceed 5000 characters'],
    default: '',
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Task project is required'],
    index: true,
  },
  column: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Column',
    required: [true, 'Task column is required'],
    index: true,
  },
  order: {
    type: Number,
    required: [true, 'Task order is required'],
    min: [0, 'Task order cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Task order must be an integer',
    },
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be low, medium, or high',
    },
    default: 'medium',
    required: true,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task creator is required'],
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

taskSchema.index({ project: 1, column: 1, order: 1 });
taskSchema.index({ project: 1, dueDate: 1 });

export default mongoose.model('Task', taskSchema);