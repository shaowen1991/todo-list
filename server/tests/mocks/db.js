import { jest } from '@jest/globals';

// create a simple db mock with a query function
const db = {
  query: jest.fn(),
};

// reset method for tests
const resetMocks = () => {
  db.query.mockReset();
};

export default db;
export { resetMocks };
