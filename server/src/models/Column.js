import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Column title is required'],
    trim: true,
    minlength: [1, 'Column title cannot be empty'],
    maxlength: [80, 'Column title cannot exceed 80 characters'],
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Column project is required'],
    index: true,
  },
  order: {
    type: Number,
    required: [true, 'Column order is required'],
    min: [0, 'Column order cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Column order must be an integer',
    },
  },
});

columnSchema.index({ project: 1, order: 1 });

export default mongoose.model('Column', columnSchema);