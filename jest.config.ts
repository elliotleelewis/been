export default {
	setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
	reporters: ['default', ['jest-junit', { outputDirectory: 'reports' }]],
};
