const {join} = require('path');

module.exports = {
  testEnvironment: 'jest-environment-node',
  moduleDirectories: ['node_modules', join(__dirname, 'test')],
  collectCoverage: true,
  collectCoverageFrom: ['lib/**/*.js'],
  testPathIgnorePatterns: ['/node_modules/', '\\.playground']
};
