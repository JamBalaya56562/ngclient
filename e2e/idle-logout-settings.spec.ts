import { expect, test } from './fixtures/authenticated';

test('stores the selected idle logout option in the browser', async ({ authenticatedPage: page, serverApi }) => {
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const select = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Sign out when idle' }) })
    .locator('sh-select');
  await expect(select.locator('input')).toHaveValue('0');
  await select.click();
  await page.getByRole('option', { name: 'After 30 minutes without activity', exact: true }).click();
  await expect(select.locator('input')).toHaveValue('30');
  expect(await page.evaluate(() => localStorage.getItem('v1:duplicati:idleLogoutMinutes'))).toBe('30');
  expect(serverApi.settingsRequests).toHaveLength(0);
});
