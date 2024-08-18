module.exports = {
	root: true,
	env: {
		es2020: true,
	},
	ignorePatterns: ['.angular/', 'coverage/', 'dist/', 'node_modules/'],
	overrides: [
		{
			files: ['*.ts'],
			parserOptions: {
				project: ['tsconfig.json'],
				createDefaultProgram: true,
			},
			plugins: ['file-progress', 'jest', 'jsdoc'],
			settings: {
				'import/resolver': {
					typescript: true,
					node: true,
				},
			},
			extends: [
				'eslint:recommended',
				'plugin:@angular-eslint/all',
				'plugin:@typescript-eslint/strict',
				'plugin:@typescript-eslint/strict-type-checked',
				'plugin:@typescript-eslint/stylistic',
				'plugin:@typescript-eslint/stylistic-type-checked',
				'plugin:eslint-comments/recommended',
				'plugin:import/recommended',
				'plugin:import/typescript',
				'plugin:jest/recommended',
				'plugin:tailwindcss/recommended',
				'plugin:unicorn/recommended',
				'prettier',
			],
			rules: {
				'@angular-eslint/prefer-standalone': 'off',
				'@angular-eslint/prefer-standalone-component': 'off',
				'@typescript-eslint/no-extraneous-class': 'off',
				'file-progress/activate': 'warn',
				'import/consistent-type-specifier-style': [
					'error',
					'prefer-inline',
				],
				'import/first': 'error',
				'import/newline-after-import': 'error',
				'import/no-duplicates': [
					'error',
					{
						'prefer-inline': true,
					},
				],
				'import/order': [
					'error',
					{
						alphabetize: {
							order: 'asc',
						},
						'newlines-between': 'always',
						pathGroups: [
							{
								pattern: '@app-*/**',
								group: 'external',
								position: 'after',
							},
						],
						pathGroupsExcludedImportTypes: ['builtin'],
					},
				],
				'jsdoc/no-types': 'error',
				'jsdoc/tag-lines': [
					'error',
					'any',
					{
						startLines: 1,
					},
				],
				'unicorn/no-array-reduce': 'off',
				'unicorn/prefer-top-level-await': 'off',
				'unicorn/prevent-abbreviations': 'off',
				curly: 'error',
				eqeqeq: ['error', 'always'],
				'lines-between-class-members': [
					'error',
					'always',
					{
						exceptAfterSingleLine: true,
					},
				],
				'max-classes-per-file': ['error', 1],
				'no-empty': 'error',
				'no-restricted-imports': [
					'error',
					{
						paths: ['rxjs/Rx', 'subsink/dist/subsink'],
						patterns: ['app/*', 'rxjs/internal/*'],
					},
				],
				'no-underscore-dangle': 'off',
				'sort-imports': [
					'error',
					{
						ignoreDeclarationSort: true,
					},
				],
			},
		},
		{
			files: ['*.html'],
			extends: [
				'plugin:@angular-eslint/template/recommended',
				'plugin:@angular-eslint/template/accessibility',
				'plugin:tailwindcss/recommended',
			],
		},
	],
};
