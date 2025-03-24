export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {},
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/?(*.)+(spec|test).js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/setup.js',
    '/tests/mocks/',
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!**/node_modules/**', '!**/vendor/**'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  moduleFileExtensions: ['js', 'json', 'node'],
  transformIgnorePatterns: ['/node_modules/(?!.*\\.mjs$)'],
};
