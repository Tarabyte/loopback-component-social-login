module.exports = {
  testEnvironment: 'jest-environment-node',
  collectCoverage: true,
  collectCoverageFrom: ['lib/**/*.js'],
  testPathIgnorePatterns: ['/node_modules/', '\\.playground']
};
