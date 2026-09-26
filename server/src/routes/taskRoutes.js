import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createComment,
  createTask,
  deleteComment,
  deleteTask,
  getTask,
  listComments,
  listMyTasks,
  listTasks,
  moveTask,
  updateTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { listTeam } from '../controllers/projectController.js';
import { asyncHandler } from '../middleware/asyncMiddleware.js';
import { requireProjectMember } from '../middleware/projectMiddleware.js';
import { requireTaskMember } from '../middleware/taskMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const projectId = param('projectId').isMongoId().withMessage('Project id must be valid');
const taskId = param('id').isMongoId().withMessage('Task id must be valid');
const commentId = param('commentId').isMongoId().withMessage('Comment id must be valid');
const title = body('title').isString().trim().isLength({ min: 1, max: 160 }).withMessage('Task title must be between 1 and 160 characters');
const optionalTitle = body('title').optional().isString().trim().isLength({ min: 1, max: 160 }).withMessage('Task title must be between 1 and 160 characters');
const description = body('description').optional().isString().trim().isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters');
const priority = body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high');
const column = body('column').isMongoId().withMessage('Column id must be valid');
const optionalColumn = body('column').optional().isMongoId().withMessage('Column id must be valid');
const order = body('order').optional().isInt({ min: 0 }).toInt().withMessage('Task order must be a non-negative integer');
const moveOrder = body('order').isInt({ min: 0 }).toInt().withMessage('Task order must be a non-negative integer');
const optionalAssignee = body('assignee').optional({ nullable: true }).isMongoId().withMessage('Assignee id must be valid');
const dueDate = body('dueDate').optional({ nullable: true }).isISO8601().toDate().withMessage('Due date must be a valid date');
const commentText = body('text').isString().trim().isLength({ min: 1, max: 3000 }).withMessage('Comment text must be between 1 and 3000 characters');
const router = Router();

router.use(protect);
router.get('/tasks/mine', asyncHandler(listMyTasks));
router.get('/team', asyncHandler(listTeam));
router.get('/projects/:projectId/tasks', [projectId, validate, asyncHandler(requireProjectMember), asyncHandler(listTasks)]);
router.post('/projects/:projectId/tasks', [projectId, title, description, column, order, optionalAssignee, priority, dueDate, validate, asyncHandler(requireProjectMember), asyncHandler(createTask)]);
router.patch('/tasks/:id', [taskId, optionalTitle, description, optionalColumn, order, optionalAssignee, priority, dueDate, validate, asyncHandler(requireTaskMember), asyncHandler(updateTask)]);
router.get('/tasks/:id', [taskId, validate, asyncHandler(requireTaskMember), asyncHandler(getTask)]);
router.delete('/tasks/:id', [taskId, validate, asyncHandler(requireTaskMember), asyncHandler(deleteTask)]);
router.patch('/tasks/:id/move', [taskId, column, moveOrder, validate, asyncHandler(requireTaskMember), asyncHandler(moveTask)]);
router.get('/tasks/:id/comments', [taskId, validate, asyncHandler(requireTaskMember), asyncHandler(listComments)]);
router.post('/tasks/:id/comments', [taskId, commentText, validate, asyncHandler(requireTaskMember), asyncHandler(createComment)]);
router.delete('/tasks/:id/comments/:commentId', [taskId, commentId, validate, asyncHandler(requireTaskMember), asyncHandler(deleteComment)]);

export default router;