module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/core/tests/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^react-dnd$': '<rootDir>/src/core/tests/__mocks__/react-dnd.ts',
    '^react-dnd-html5-backend$': '<rootDir>/src/core/tests/__mocks__/react-dnd-html5-backend.ts',
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.app.json',
      diagnostics: true,
    }],
  },
  testMatch: ['<rootDir>/src/core/tests/**/*.test.tsx'], 
};