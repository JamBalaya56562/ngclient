import { expect, test } from './fixtures/authenticated';

test.use({ initialServerSettings: { 'hide-console-connection-status': 'True' } });

test('loads and saves both states of console status visibility', async ({ authenticatedPage: page, serverApi }) => {
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const section = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Toggle console connection status', exact: true }) });
  const toggle = section.locator('#hide-console-connection-status');
  await expect(toggle).not.toBeChecked();
  expect(serverApi.settingsRequests).toHaveLength(0);

  await section
    .locator('label[for=hide-console-connection-status]')
    .filter({ hasText: 'Console connection status is hidden' })
    .click();
  await expect(toggle).toBeChecked();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(1);
  expect(serverApi.settingsRequests[0].request().postDataJSON()).toEqual({ 'hide-console-connection-status': 'False' });
  await serverApi.settingsRequests[0].fulfill({ status: 200, json: {} });

  await toggle.press('Space');
  await expect(toggle).not.toBeChecked();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(2);
  expect(serverApi.settingsRequests[1].request().postDataJSON()).toEqual({ 'hide-console-connection-status': 'True' });
  await serverApi.settingsRequests[1].fulfill({ status: 200, json: {} });
});
