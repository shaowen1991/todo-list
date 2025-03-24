import { jest, describe, test, expect } from '@jest/globals';
import authRequired from '../../src/middleware/authRequired.js';
import HttpStatus from '../../src/constants/httpStatus.js';

describe('Auth Middleware', () => {
  test('should call next() if user is authenticated', () => {
    const req = {
      session: {
        userId: 123,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authRequired(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('should return 401 if user is not authenticated', () => {
    const req = {
      session: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authRequired(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  test('should handle case when session is undefined', () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authRequired(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });
});
