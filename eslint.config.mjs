import path from 'node:path';
import { fileURLToPath } from 'node:url';

import reactUseMemo from '@arthurgeron/eslint-plugin-react-usememo';
import { includeIgnoreFile, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import vitest from '@vitest/eslint-plugin';
import configPrettier from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
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
		plugins: {
			'@arthurgeron/react-usememo': fixupPluginRules(reactUseMemo),
			'react-compiler': reactCompiler,
			'react-hooks': fixupPluginRules(reactHooks),
			'react-refresh': reactRefresh,
		},
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.strictTypeChecked,
			...tseslint.configs.stylisticTypeChecked,
			comments.recommended,
			...compat.extends('plugin:import/recommended'),
			...compat.extends('plugin:import/typescript'),
			jsdoc.configs['flat/recommended-typescript-error'],
			jsxA11y.flatConfigs.strict,
			react.configs.flat.recommended,
			react.configs.flat['jsx-runtime'],
			...tailwind.configs['flat/recommended'],
			unicorn.configs['flat/recommended'],
			vitest.configs.recommended,
		],
		languageOptions: {
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
			react: {
				version: 'detect',
			},
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'@arthurgeron/react-usememo/require-memo': 'error',
			'@arthurgeron/react-usememo/require-usememo': 'error',
			'@typescript-eslint/consistent-type-imports': 'error',
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
			'react-compiler/react-compiler': 'error',
			'react-refresh/only-export-components': 'error',
			'react/prop-types': 'off',
			'unicorn/no-array-reduce': 'off',
			'unicorn/no-null': 'off',
			'unicorn/prefer-top-level-await': 'off',
			'unicorn/prevent-abbreviations': 'off',
			curly: 'error',
			eqeqeq: ['error', 'always'],
			'no-empty': 'error',
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
	{
		files: ['**/*.spec.{ts,tsx}'],
		rules: {
			'@arthurgeron/react-usememo/require-usememo': 'off',
		},
	},
	configPrettier,
);
