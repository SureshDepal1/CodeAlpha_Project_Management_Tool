import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const email = body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail();
const password = body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters');
const registerValidation = [
  body('name').isString().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters'),
  email,
  password,
  body('avatarColor').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Avatar color must be a valid hex color'),
];
const loginValidation = [email, password];
const router = Router();

router.post('/register', registerValidation, validate, asyncHandler(register));
router.post('/login', loginValidation, validate, asyncHandler(login));
router.get('/me', protect, asyncHandler(getMe));

export default router;