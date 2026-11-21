import { expect, test } from './fixtures/authenticated';

test.use({
  initialBackups: [
    [{ Backup: { ID: '42', Name: 'Documents', OperationType: 'Backup' }, Schedule: null }],
    { scope: 'test' },
  ],
});

test('keeps the chosen backup view after a reload', async ({ authenticatedPage: page, serverApi }) => {
  const views = page.locator('app-home sh-button-group').filter({ has: page.getByRole('button', { name: 'Details' }) });
  const table = page.locator('app-home sh-table');
  await expect(views).toBeVisible();
  await expect(table).toHaveCount(0);
  await views.getByRole('button', { name: 'Details', exact: true }).click();
  await expect(table).toContainText('Documents');

  await page.reload();
  await expect.poll(() => serverApi.refreshRequests.length).toBe(1);
  await serverApi.refreshRequests[0].fulfill({
    json: { AccessToken: 'fixture-access-token', RefreshNonce: 'rotated-nonce' },
  });
  await expect(table).toContainText('Documents');
  await views.getByRole('button', { name: 'List', exact: true }).click();
  await expect(table).toHaveCount(0);
});
