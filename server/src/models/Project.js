import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Member user is required'],
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'member'],
      message: 'Member role must be admin or member',
    },
    default: 'member',
    required: true,
  },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    minlength: [1, 'Project title cannot be empty'],
    maxlength: [120, 'Project title cannot exceed 120 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Project description cannot exceed 2000 characters'],
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project owner is required'],
    index: true,
  },
  members: {
    type: [memberSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ 'members.user': 1, createdAt: -1 });

export default mongoose.model('Project', projectSchema);