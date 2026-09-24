import { Router } from 'express';
import { body, param } from 'express-validator';
import { createColumn, deleteColumn, listColumns, updateColumn } from '../controllers/columnController.js';
import { protect } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncMiddleware.js';
import { requireProjectMember } from '../middleware/projectMiddleware.js';
import { requireColumnProjectMember, requireProjectColumn } from '../middleware/columnMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const projectId = param('projectId').isMongoId().withMessage('Project id must be valid');
const columnId = param('id').isMongoId().withMessage('Column id must be valid');
const title = body('title').isString().trim().isLength({ min: 1, max: 80 }).withMessage('Column title must be between 1 and 80 characters');
const optionalTitle = body('title').optional().isString().trim().isLength({ min: 1, max: 80 }).withMessage('Column title must be between 1 and 80 characters');
const order = body('order').optional().isInt({ min: 0 }).withMessage('Column order must be a non-negative integer');
const router = Router();

router.use(protect);
router.get('/projects/:projectId/columns', [projectId, validate, asyncHandler(requireProjectMember), asyncHandler(listColumns)]);
router.post('/projects/:projectId/columns', [projectId, title, order, validate, asyncHandler(requireProjectMember), asyncHandler(createColumn)]);
router.patch('/columns/:id', [columnId, optionalTitle, order, validate, asyncHandler(requireColumnProjectMember), asyncHandler(requireProjectColumn), asyncHandler(updateColumn)]);
router.delete('/columns/:id', [columnId, validate, asyncHandler(requireColumnProjectMember), asyncHandler(requireProjectColumn), asyncHandler(deleteColumn)]);

export default router;