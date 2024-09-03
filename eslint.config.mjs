import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import configPrettier from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import react from 'eslint-plugin-react';
import tailwind from 'eslint-plugin-tailwindcss';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: eslint.configs.recommended,
});

export default tseslint.config(
	includeIgnoreFile(path.resolve(__dirname, '.gitignore')),
	{
		extends: [eslint.configs.recommended],
		languageOptions: {
			globals: {
				...globals.serviceworker,
				...globals.browser,
			},
		},
	},
	{
		files: ['**/*.{ts,tsx}'],
		...react.configs.flat.recommended,
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.strictTypeChecked,
			...tseslint.configs.stylisticTypeChecked,
			comments.recommended,
			...compat.extends('plugin:import/recommended'),
			...compat.extends('plugin:import/typescript'),
			jsdoc.configs['flat/recommended-typescript-error'],
			...compat.extends('plugin:react-hooks/recommended'),
			...tailwind.configs['flat/recommended'],
			unicorn.configs['flat/recommended'],
		],
		languageOptions: {
			...react.configs.flat.recommended.languageOptions,
			parserOptions: {
				project: './tsconfig.json',
			},
		},
		settings: {
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: './tsconfig.json',
				},
			},
		},
		rules: {
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'default',
					format: ['camelCase'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'allow',
				},
				{
					selector: 'import',
					format: ['camelCase', 'PascalCase'],
				},
				{
					selector: 'variable',
					format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'allow',
				},
				{
					selector: 'typeLike',
					format: ['PascalCase'],
				},
			],
			'@typescript-eslint/no-extraneous-class': 'off',
			'import/consistent-type-specifier-style': [
				'error',
				'prefer-inline',
			],
			'import/first': 'error',
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
			'unicorn/no-array-reduce': 'off',
			'unicorn/no-null': 'off',
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
			'sort-imports': [
				'error',
				{
					ignoreDeclarationSort: true,
				},
			],

			// TODO: Enable once rules support ESLint 9
			'import/namespace': 'off',
			'import/newline-after-import': 'off',
			'import/no-named-as-default': 'off',
			'import/no-named-as-default-member': 'off',
		},
	},
	configPrettier,
);
