import { jest, beforeAll, afterAll } from '@jest/globals';
import mockDb from './mocks/db.js';

// mock environment variables
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-secret';
process.env.FRONTEND_URL = 'http://localhost:3000';

// mock the database
jest.mock('../src/db/index.js', () => mockDb);

// mock bcrypt since we don't need actual password hashing in tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2a$10$hashedpasswordmock'),
  compare: jest.fn().mockResolvedValue(true),
}));

beforeAll(() => {});
afterAll(() => {});
