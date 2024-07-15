module.exports = {
    collectCoverage: true,
    reporters: ['default', 'jest-sonar'],
    coverageReporters: ['json', 'lcov','text'],
    coverageDirectory: 'coverage',
    testMatch: ['**/test/**/*.test.js'],
  };