import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatarColor: user.avatarColor,
  createdAt: user.createdAt,
});

const createToken = (userId) => jwt.sign(
  { userId: userId.toString() },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
);

export const register = async (req, res) => {
  const { name, email, password, avatarColor } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 409;
    error.code = 'EMAIL_IN_USE';
    throw error;
  }

  const user = await User.create({ name, email, password, avatarColor });

  return res.status(201).json({
    message: 'Account created successfully',
    token: createToken(user._id),
    user: publicUser(user),
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  const validPassword = user && await user.comparePassword(password);

  if (!validPassword) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  return res.status(200).json({
    message: 'Login successful',
    token: createToken(user._id),
    user: publicUser(user),
  });
};

export const getMe = async (req, res) => res.status(200).json({ user: publicUser(req.user) });