import { expect, test } from './fixtures/authenticated';

test('persists both file tree sorting preferences across reload', async ({ authenticatedPage: page, serverApi }) => {
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const section = page.locator('section').filter({ has: page.getByRole('heading', { name: 'File tree sorting' }) });
  const foldersFirst = section.locator('input[type=checkbox]').nth(0);
  const caseSensitive = section.locator('input[type=checkbox]').nth(1);

  await expect(foldersFirst).toBeChecked();
  await expect(caseSensitive).not.toBeChecked();
  await foldersFirst.uncheck();
  await caseSensitive.check();
  await expect(section).toContainText('Files and folders are mixed together');
  await expect(section).toContainText('Sorting is case sensitive');

  await page.reload();
  await expect.poll(() => serverApi.refreshRequests.length).toBe(1);
  await serverApi.refreshRequests[0].fulfill({
    json: { AccessToken: 'fixture-access-token', RefreshNonce: 'rotated-nonce' },
  });
  await expect(foldersFirst).not.toBeChecked();
  await expect(caseSensitive).toBeChecked();
});
