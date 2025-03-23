import HttpStatus from '../constants/httpStatus.js';

/**
 * Middleware for protected api calls to check if the user is authenticated
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function authRequired(req, res, next) {
  if (!req.session.userId) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Unauthorized' });
  }

  next();
}

export default authRequired;
