/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ['<rootDir>/tests/global/MockPrismaSingleton.ts'],
  preset: 'ts-jest',
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
};
