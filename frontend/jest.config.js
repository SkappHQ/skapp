const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './', // Path to your Next.js app
});

const customJestConfig = {
  moduleNameMapper: {
    "^~community(.*)$": "<rootDir>/src/community$1",
    "^~enterprise(.*)$": "<rootDir>/src/fallback$1",
    "^~public(.*)$": "<rootDir>/public$1",
    "^~styles(.*)$": "<rootDir>/styles$1",
    "^~i18n(.*)$": "<rootDir>/i18n$1",
    "^~middleware(.*)$": "<rootDir>/middleware$1"
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: true, // Enable coverage collection
  coverageDirectory: 'coverage', // Directory for storing coverage reports
  coverageReporters: ['html', 'lcov'], // Coverage formats
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}', // Files to include
    '!**/node_modules/**',  // Exclude node_modules
    '!**/.next/**',         // Exclude Next.js build artifacts
    '!**/coverage/**',      // Exclude coverage directory
    '!**/jest.config.js',   // Exclude configuration files
    '!./pages/**',
    '!**/types/**',
    '!**/enums/**',
    '!**/constants/**',
    '!**/organisms/**',
    '!**/template/**',
    '!**/assets/**',
    '!**/public/**',
    '!**/data/**',
    '!**/QueryKeys.ts/**',
    '!**/configs/**',
  ],
};

module.exports = createJestConfig(customJestConfig);