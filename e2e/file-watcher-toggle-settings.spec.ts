import { expect, test } from './fixtures/authenticated';

test.use({ initialServerSettings: { 'disable-file-watcher': 'False' } });

test.beforeEach(({ serverApi }) => {
  serverApi.setServerOnlyOptions(['use-file-watcher']);
});

test('disables the watcher through Signal Forms and restores the checked value after a failed save', async ({
  authenticatedPage: page,
  serverApi,
}) => {
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const toggle = page.locator('#file-watcher');
  await expect(toggle).toBeChecked();
  await page.locator('label[for=file-watcher]').click();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(1);
  expect(serverApi.settingsRequests[0].request().postDataJSON()).toEqual({ 'disable-file-watcher': 'True' });
  await expect(toggle).toBeDisabled();

  await serverApi.settingsRequests[0].fulfill({ status: 500, json: { Error: 'Watcher setting rejected' } });
  await expect(toggle).toBeEnabled();
  await expect(toggle).toBeChecked();

  await toggle.press('Space');
  await expect.poll(() => serverApi.settingsRequests.length).toBe(2);
  await serverApi.settingsRequests[1].fulfill({ status: 200, json: {} });
  await expect(toggle).toBeEnabled();
  await expect(toggle).not.toBeChecked();
});
