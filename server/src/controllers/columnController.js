import Column from '../models/Column.js';
import Task from '../models/Task.js';

export const listColumns = async (req, res) => {
  const columns = await Column.find({ project: req.project._id }).sort({ order: 1 });
  return res.status(200).json({ columns });
};

export const createColumn = async (req, res) => {
  const lastColumn = await Column.findOne({ project: req.project._id }).sort({ order: -1 });
  const column = await Column.create({
    title: req.body.title,
    project: req.project._id,
    order: req.body.order ?? (lastColumn ? lastColumn.order + 1 : 0),
  });

  return res.status(201).json({ column });
};

export const updateColumn = async (req, res) => {
  req.column.title = req.body.title ?? req.column.title;
  if (req.body.order !== undefined) req.column.order = req.body.order;
  await req.column.save();
  return res.status(200).json({ column: req.column });
};

export const deleteColumn = async (req, res) => {
  const taskCount = await Task.countDocuments({ column: req.column._id });
  if (taskCount > 0) {
    const error = new Error('Cannot delete a column that contains tasks');
    error.statusCode = 409;
    error.code = 'COLUMN_NOT_EMPTY';
    throw error;
  }

  await req.column.deleteOne();
  return res.status(204).send();
};