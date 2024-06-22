module.exports = {
	setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
	reporters: ['default', ['jest-junit', { outputDirectory: 'reports' }]],
};
