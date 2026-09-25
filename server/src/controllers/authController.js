import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import User from '../models/User.js';
import { sendVerificationEmail } from '../config/mailer.js';

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

  const verificationToken = randomBytes(32).toString('hex');
  const user = await User.create({
    name,
    email,
    password,
    avatarColor,
    isVerified: false,
    verificationToken,
    verificationTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
  });
  await sendVerificationEmail({ email: user.email, name: user.name, token: verificationToken });

  return res.status(201).json({
    message: 'Account created. Check your email to verify your address before logging in.',
  });
};

export const verifyEmail = async (req, res) => {
  const user = await User.findOne({ verificationToken: req.params.token, verificationTokenExpires: { $gt: new Date() } }).select('+verificationToken +verificationTokenExpires');
  if (!user) {
    const error = new Error('This verification link is invalid or has expired. Request a new verification email.');
    error.statusCode = 400;
    error.code = 'VERIFICATION_TOKEN_INVALID';
    throw error;
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  await user.save();
  return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
};

export const resendVerification = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || user.isVerified) return res.status(200).json({ message: 'If that account needs verification, a new email is on its way.' });

  const verificationToken = randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();
  await sendVerificationEmail({ email: user.email, name: user.name, token: verificationToken });
  return res.status(200).json({ message: 'If that account needs verification, a new email is on its way.' });
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

  if (!user.isVerified) {
    const error = new Error('Please verify your email before logging in');
    error.statusCode = 403;
    error.code = 'EMAIL_NOT_VERIFIED';
    throw error;
  }

  return res.status(200).json({
    message: 'Login successful',
    token: createToken(user._id),
    user: publicUser(user),
  });
};

export const getMe = async (req, res) => res.status(200).json({ user: publicUser(req.user) });