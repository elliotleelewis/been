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
				'plugin:@angular-eslint/recommended',
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
				'@angular-eslint/component-max-inline-declarations': [
					'error',
					{
						animations: 100,
						styles: 0,
					},
				],
				'@angular-eslint/component-class-suffix': 'error',
				'@angular-eslint/component-selector': [
					'error',
					{
						type: 'element',
						prefix: 'app',
						style: 'kebab-case',
					},
				],
				'@angular-eslint/contextual-decorator': 'error',
				'@angular-eslint/contextual-lifecycle': 'error',
				'@angular-eslint/directive-class-suffix': 'error',
				'@angular-eslint/directive-selector': [
					'error',
					{
						type: 'attribute',
						prefix: 'app',
						style: 'camelCase',
					},
				],
				'@angular-eslint/no-attribute-decorator': 'error',
				'@angular-eslint/no-conflicting-lifecycle': 'error',
				'@angular-eslint/no-forward-ref': 'error',
				'@angular-eslint/no-host-metadata-property': 'error',
				'@angular-eslint/no-input-prefix': 'error',
				'@angular-eslint/no-input-rename': 'error',
				'@angular-eslint/no-inputs-metadata-property': 'error',
				'@angular-eslint/no-lifecycle-call': 'error',
				'@angular-eslint/no-output-native': 'error',
				'@angular-eslint/no-output-on-prefix': 'error',
				'@angular-eslint/no-output-rename': 'error',
				'@angular-eslint/no-outputs-metadata-property': 'error',
				'@angular-eslint/no-pipe-impure': 'error',
				'@angular-eslint/no-queries-metadata-property': 'error',
				'@angular-eslint/pipe-prefix': [
					'error',
					{
						prefixes: ['app'],
					},
				],
				'@angular-eslint/prefer-on-push-component-change-detection':
					'warn',
				'@angular-eslint/prefer-output-readonly': 'error',
				'@angular-eslint/relative-url-prefix': 'error',
				'@angular-eslint/use-component-selector': 'error',
				'@angular-eslint/use-component-view-encapsulation': 'error',
				'@angular-eslint/use-injectable-provided-in': 'error',
				'@angular-eslint/use-lifecycle-interface': 'error',
				'@angular-eslint/use-pipe-transform-interface': 'error',
				'@typescript-eslint/array-type': 'error',
				'@typescript-eslint/ban-ts-comment': 'error',
				'@typescript-eslint/ban-tslint-comment': 'error',
				'@typescript-eslint/consistent-type-imports': 'error',
				'@typescript-eslint/dot-notation': 'error',
				'@typescript-eslint/explicit-member-accessibility': [
					'error',
					{
						accessibility: 'no-public',
					},
				],
				'@typescript-eslint/explicit-module-boundary-types': 'error',
				'@typescript-eslint/naming-convention': [
					'error',
					{
						selector: 'default',
						format: ['camelCase'],
						leadingUnderscore: 'forbid',
						trailingUnderscore: 'forbid',
					},
					{
						selector: 'typeLike',
						format: ['PascalCase'],
						leadingUnderscore: 'forbid',
						trailingUnderscore: 'forbid',
					},
					{
						selector: 'enumMember',
						format: ['PascalCase'],
					},
					{
						selector: 'parameter',
						modifiers: ['unused'],
						format: ['camelCase'],
						leadingUnderscore: 'require',
					},
					{
						selector: 'property',
						modifiers: ['readonly', 'static'],
						format: ['UPPER_CASE'],
					},
					{
						selector: 'property',
						modifiers: ['private'],
						format: ['camelCase'],
						leadingUnderscore: 'require',
					},
					{
						selector: 'variable',
						modifiers: ['const', 'exported'],
						format: ['UPPER_CASE'],
					},
					{
						selector: 'variable',
						modifiers: ['const', 'exported'],
						types: ['function'],
						format: ['camelCase'],
					},
				],
				'@typescript-eslint/member-ordering': 'error',
				'@typescript-eslint/no-empty-function': 'error',
				'@typescript-eslint/no-explicit-any': 'error',
				'@typescript-eslint/no-extraneous-class': 'off',
				'@typescript-eslint/no-non-null-asserted-optional-chain':
					'error',
				'@typescript-eslint/no-non-null-assertion': 'error',
				'@typescript-eslint/no-unused-vars': 'error',
				'@typescript-eslint/no-var-requires': 'error',
				'@typescript-eslint/unbound-method': 'off',
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
				'plugin:tailwindcss/recommended',
			],
			rules: {
				'@angular-eslint/template/alt-text': 'error',
				'@angular-eslint/template/banana-in-box': 'error',
				'@angular-eslint/template/click-events-have-key-events':
					'error',
				'@angular-eslint/template/conditional-complexity': 'error',
				'@angular-eslint/template/cyclomatic-complexity': 'error',
				'@angular-eslint/template/elements-content': 'error',
				'@angular-eslint/template/label-has-associated-control':
					'error',
				'@angular-eslint/template/mouse-events-have-key-events':
					'error',
				'@angular-eslint/template/no-any': 'error',
				'@angular-eslint/template/no-autofocus': 'error',
				'@angular-eslint/template/no-call-expression': 'error',
				'@angular-eslint/template/no-distracting-elements': 'error',
				'@angular-eslint/template/no-negated-async': 'error',
				'@angular-eslint/template/no-positive-tabindex': 'error',
				'@angular-eslint/template/table-scope': 'error',
				'@angular-eslint/template/use-track-by-function': 'error',
				'@angular-eslint/template/valid-aria': 'error',
			},
		},
	],
};
