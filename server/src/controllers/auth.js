import bcrypt from 'bcryptjs';
import db from '../db/index.js';
import HttpStatus from '../constants/httpStatus.js';

/**
 * Register a new user
 * POST /api/auth/register
 *
 * @param {string} username
 * @param {string} password
 * @returns {object}
 */
const register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ error: 'Missing username or password' });
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
        .json({ error: 'Username already exists' });
    }

    // hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // insert new user record and return user info
    const result = await db.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, password_hash]
    );

    const newUser = result.rows[0];

    // after successful registration, automatically create session to log in the user
    req.session.regenerate((err) => {
      if (err) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: 'Server error' });
      }

      req.session.userId = newUser.id;
      req.session.username = newUser.username;

      res.status(HttpStatus.CREATED).json({
        message: 'Registration successful',
        user: {
          id: newUser.id,
          username: newUser.username,
        },
      });
    });
  } catch (err) {
    console.error('Error:', err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Server error' });
  }
};

/**
 * Login an existing user
 * POST /api/auth/login
 *
 * @param {string} username
 * @param {string} password
 * @returns {object}
 */
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ error: 'Missing username or password' });
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
        .json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];

    // verify password
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ error: 'Invalid username or password' });
    }

    // login successful, save user id and other info in session
    req.session.regenerate((err) => {
      if (err) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: 'Server error' });
      }

      req.session.userId = user.id;
      req.session.username = username;

      res.status(HttpStatus.OK).json({
        message: 'Login successful',
        user: { id: user.id, username: username },
      });
    });
  } catch (err) {
    console.error('Error:', err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Server error' });
  }
};

/**
 * Logout the current user
 * POST /api/auth/logout
 *
 * @returns {object}
 */
const logout = (req, res) => {
  // destroy session and clear cookie
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Logout failed' });
    }

    // clear cookie
    res.clearCookie('connect.sid');
    res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  });
};

/**
 * Get current user information
 * GET /api/auth/me
 *
 * @requires Authentication
 * @returns {object}
 */
const getMe = (req, res) => {
  res.status(HttpStatus.OK).json({
    id: req.session.userId,
    username: req.session.username,
  });
};

export { register, login, logout, getMe };
