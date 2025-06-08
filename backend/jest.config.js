// backend/jest.config.js
/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.spec.ts",
    "**/tests/**/*.test.ts",
    "**/tests/**/*.spec.ts",
    "**/*.test.ts",
    "**/*.spec.ts",
  ],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          types: ["node", "jest", "@jest/globals"],
        },
      },
    ],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/__tests__/**",
    "!src/tests/**",
    "!src/server.ts",
    "!src/app.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testTimeout: 30000,
  clearMocks: true,
  restoreMocks: true,
  // Support pour les modules ES6
  extensionsToTreatAsEsm: [".ts"],
  // Globals explicites
  globals: {
    "ts-jest": {
      useESM: false,
    },
  },
};
