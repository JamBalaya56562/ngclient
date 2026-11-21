import { expect, test } from './fixtures/authenticated';

test.use({ initialServerSettings: { 'disable-tray-icon-login': 'False' } });

test('loads and saves both states of the tray toggle', async ({ authenticatedPage: page, serverApi }) => {
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const section = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Prevent tray icon automatic log-in', exact: true }) });
  const toggle = section.locator('sh-toggle input[type=checkbox]:not(.internal-input)');
  await expect(toggle).not.toBeChecked();
  expect(serverApi.settingsRequests).toHaveLength(0);

  await section.locator('sh-toggle label').click();
  await expect(toggle).toBeChecked();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(1);
  expect(serverApi.settingsRequests[0].request().postDataJSON()).toEqual({ 'disable-tray-icon-login': 'True' });
  await serverApi.settingsRequests[0].fulfill({ status: 200, json: {} });

  await toggle.press('Space');
  await expect(toggle).not.toBeChecked();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(2);
  expect(serverApi.settingsRequests[1].request().postDataJSON()).toEqual({ 'disable-tray-icon-login': 'False' });
  await serverApi.settingsRequests[1].fulfill({ status: 200, json: {} });
});
