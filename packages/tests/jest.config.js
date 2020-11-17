module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./jest.setup.ts'],
    testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/helpers']
}
