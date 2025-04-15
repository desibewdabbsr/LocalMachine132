// backend/jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    verbose: true,
    setupFilesAfterEnv: [
        '<rootDir>/tests/setup/jest.setup.ts',
        '<rootDir>/tests/setup/fetch-setup.ts'
    ]
};