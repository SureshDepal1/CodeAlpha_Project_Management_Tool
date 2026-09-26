import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  addMember,
  createProject,
  deleteProject,
  getProject,
  getProjectStats,
  listProjects,
  removeMember,
  updateProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncMiddleware.js';
import { requireProjectAdmin, requireProjectMember } from '../middleware/projectMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const projectId = param('id').isMongoId().withMessage('Project id must be valid');
const title = body('title').optional().isString().trim().isLength({ min: 1, max: 120 }).withMessage('Title must be between 1 and 120 characters');
const description = body('description').optional().isString().trim().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters');
const memberEmail = body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail();
const router = Router();

router.use(protect);
router.get('/', asyncHandler(listProjects));
router.post('/', [body('title').isString().trim().isLength({ min: 1, max: 120 }).withMessage('Title must be between 1 and 120 characters'), description], validate, asyncHandler(createProject));
router.get('/:id', [projectId, validate, requireProjectMember], asyncHandler(getProject));
router.get('/:id/stats', [projectId, validate, asyncHandler(requireProjectMember), asyncHandler(getProjectStats)]);
router.patch('/:id', [projectId, title, description, validate, requireProjectMember], asyncHandler(updateProject));
router.delete('/:id', [projectId, validate, requireProjectMember, requireProjectAdmin], asyncHandler(deleteProject));
router.post('/:id/members', [projectId, memberEmail, validate, requireProjectMember, requireProjectAdmin], asyncHandler(addMember));
router.delete('/:id/members', [projectId, memberEmail, validate, requireProjectMember, requireProjectAdmin], asyncHandler(removeMember));

export default router;