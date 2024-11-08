import { expect, test } from '@playwright/test';

test.describe('base', () => {
	test('loads the page', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('load');

		expect(await page.title()).toBe('Been');
	});
});
