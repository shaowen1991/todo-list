import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/index.js';
import HttpStatus from '../constants/httpStatus.js';
import authRequired from '../middleware/authRequired.js';

const AuthMsgs = {
  MISSING_CREDENTIALS: 'Missing username or password',
  USERNAME_EXISTS: 'Username already exists',
  SERVER_ERROR: 'Server error',
  INVALID_CREDENTIALS: 'Invalid username or password',
  LOGOUT_FAILED: 'Logout failed',
  NOT_LOGGED_IN: 'Not logged in',
  REGISTRATION_SUCCESSFUL: 'Registration successful',
  LOGIN_SUCCESSFUL: 'Login successful',
  LOGOUT_SUCCESSFUL: 'Logged out successfully',
};

const router = express.Router();

/**
 * Register a new user
 * POST /api/auth/register
 *
 * @param {string} username
 * @param {string} password
 * @returns {object}
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ error: AuthMsgs.MISSING_CREDENTIALS });
  }

  try {
    // check if username already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rowCount > 0) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ error: AuthMsgs.USERNAME_EXISTS });
    }

    // hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // insert new user record and return user info
    const result = await db.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, password_hash]
    );

    const newUser = result.rows[0];

    // after successful registration, automatically create session to log in the user
    req.session.regenerate((err) => {
      if (err) {
        console.error('session regenerate error:', err);
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: AuthMsgs.SERVER_ERROR });
      }

      req.session.userId = newUser.id;
      req.session.username = newUser.username;

      res.status(HttpStatus.CREATED).json({
        message: AuthMsgs.REGISTRATION_SUCCESSFUL,
        user: {
          id: newUser.id,
          username: newUser.username,
        },
      });
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: AuthMsgs.SERVER_ERROR });
  }
});

/**
 * Login an existing user
 * POST /api/auth/login
 *
 * @param {string} username
 * @param {string} password
 * @returns {object}
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ error: AuthMsgs.MISSING_CREDENTIALS });
  }

  try {
    // query user
    const result = await db.query(
      'SELECT id, password_hash, username FROM users WHERE username = $1',
      [username]
    );

    if (result.rowCount === 0) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ error: AuthMsgs.INVALID_CREDENTIALS });
    }

    const user = result.rows[0];

    // verify password
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ error: AuthMsgs.INVALID_CREDENTIALS });
    }

    // login successful, save user id and other info in session
    req.session.regenerate((err) => {
      if (err) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: AuthMsgs.SERVER_ERROR });
      }

      req.session.userId = user.id;
      req.session.username = username;

      res.status(HttpStatus.OK).json({
        message: AuthMsgs.LOGIN_SUCCESSFUL,
        user: { id: user.id, username: username },
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: AuthMsgs.SERVER_ERROR });
  }
});

/**
 * Logout the current user
 * POST /api/auth/logout
 *
 * @returns {object}
 */
router.post('/logout', (req, res) => {
  // destroy session and clear cookie
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: AuthMsgs.LOGOUT_FAILED });
    }

    // clear cookie
    res.clearCookie('connect.sid');
    res.status(HttpStatus.OK).json({ message: AuthMsgs.LOGOUT_SUCCESSFUL });
  });
});

/**
 * Get current user information
 * GET /api/auth/me
 *
 * @requires Authentication
 * @returns {object}
 */
router.get('/me', authRequired, (req, res) => {
  res.status(HttpStatus.OK).json({
    id: req.session.userId,
    username: req.session.username,
  });
});

export default router;
